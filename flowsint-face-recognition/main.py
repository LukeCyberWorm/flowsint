from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Optional, List
import logging

from app.services.face_service import get_face_service
from app.services.llm_service import get_llm_service
from app.services.geolocation_service import get_geolocation_service
from app.services.osint_service import get_osint_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FlowsInt Face Recognition API",
    version="1.0.0",
    description="AI-powered facial recognition and OSINT analysis"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://rsl.scarletredsolutions.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models
class FaceDetectionResponse(BaseModel):
    face_count: int
    faces: List[dict]
    processing_time_ms: float


class OSINTSearchRequest(BaseModel):
    image_data: str  # Base64 encoded
    search_platforms: List[str] = ["facebook", "instagram", "linkedin", "twitter"]
    confidence_threshold: float = 0.85


class OSINTResult(BaseModel):
    platform: str
    profile_url: str
    confidence_score: float
    profile_data: dict


class GeolocationResult(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    confidence: float
    source: str  # "exif" or "visual"


class AnalysisReport(BaseModel):
    face_detection: FaceDetectionResponse
    osint_results: List[OSINTResult]
    geolocation: Optional[GeolocationResult]
    llm_analysis: str
    confidence_score: float


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint for Docker/Kubernetes"""
    try:
        # Check if services are loaded
        face_service = get_face_service()
        
        return {
            "status": "healthy",
            "service": "face-recognition",
            "version": "1.0.0",
            "services": {
                "face_detection": "ready",
                "llm": "ready",
                "geolocation": "ready",
                "osint": "ready"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=503, detail="Service unhealthy")


# Face detection endpoint
@app.post("/api/detect", response_model=FaceDetectionResponse)
async def detect_faces(file: UploadFile = File(...)):
    """
    Detect faces in uploaded image using InsightFace
    Returns face count, bounding boxes, and embeddings
    """
    try:
        logger.info(f"Processing file: {file.filename}")
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Get face service
        face_service = get_face_service()
        
        # Detect faces
        result = face_service.detect_faces(image_bytes)
        
        return result
    except Exception as e:
        logger.error(f"Face detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# OSINT search endpoint
@app.post("/api/osint/search", response_model=List[OSINTResult])
async def osint_search(request: OSINTSearchRequest):
    """
    Perform reverse image search across social media platforms
    Uses Social Mapper for automated profile discovery
    """
    try:
        # TODO: Implement Social Mapper integration
        logger.info(f"OSINT search on platforms: {request.search_platforms}")
        
        # Placeholder response
        return []
    except Exception as e:
        logger.error(f"OSINT search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Geolocation endpoint
@app.post("/api/geolocate", response_model=GeolocationResult)
async def geolocate_image(file: UploadFile = File(...)):
    """
    Extract geolocation from image metadata or visual analysis
    Uses ExifTool for metadata, GeoSpy for visual analysis
    """
    try:
        logger.info(f"Geolocating image: {file.filename}")
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Get geolocation service
        geoloc_service = get_geolocation_service()
        
        # Get location
        location = geoloc_service.get_location(image_bytes)
        
        if not location:
            return {
                "latitude": None,
                "longitude": None,
                "location_name": None,
                "confidence": 0.0,
                "source": "none"
            }
        
        return location
    except Exception as e:
        logger.error(f"Geolocation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Full analysis endpoint
@app.post("/api/analyze", response_model=AnalysisReport)
async def analyze_full(
    file: UploadFile = File(...),
    search_platforms: List[str] = ["facebook", "instagram", "linkedin", "twitter"]
):
    """
    Complete facial recognition + OSINT + geolocation + LLM analysis
    This is the main endpoint that orchestrates all services
    """
    import time
    start_time = time.time()
    
    try:
        logger.info(f"Full analysis for: {file.filename}")
        
        # Read image bytes
        image_bytes = await file.read()
        
        # Get services
        face_service = get_face_service()
        osint_service = get_osint_service()
        geoloc_service = get_geolocation_service()
        llm_service = get_llm_service()
        
        # 1. Face detection
        face_data = face_service.detect_faces(image_bytes)
        logger.info(f"Detected {face_data['face_count']} faces")
        
        # 2. OSINT search (if faces found)
        osint_results = []
        if face_data["face_count"] > 0:
            face_embedding = face_data["faces"][0]["embedding"]
            osint_results = osint_service.search_social_media(
                image_bytes,
                face_embedding,
                search_platforms
            )
            logger.info(f"Found {len(osint_results)} OSINT matches")
        
        # 3. Geolocation
        geolocation = geoloc_service.get_location(image_bytes)
        if geolocation:
            logger.info(f"Location: {geolocation.get('location_name', 'Unknown')}")
        
        # 4. LLM analysis (with error handling)
        llm_analysis = None
        try:
            llm_analysis = llm_service.generate_profile_analysis(
                face_data,
                osint_results,
                geolocation
            )
        except Exception as llm_error:
            logger.error(f"LLM analysis failed (non-critical): {llm_error}")
            llm_analysis = {
                "profile_summary": "Análise LLM indisponível no momento",
                "risk_assessment": "N/A",
                "recommendations": ["Sistema de análise em manutenção"]
            }
        
        # Calculate overall confidence score
        confidence_scores = []
        if face_data["face_count"] > 0:
            confidence_scores.append(face_data["faces"][0]["det_score"])
        if osint_results:
            confidence_scores.extend([r["confidence_score"] for r in osint_results])
        if geolocation:
            confidence_scores.append(geolocation["confidence"])
        
        overall_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0.0
        processing_time = time.time() - start_time
        
        # Transform face_data to match frontend expectations
        face_detection_response = {
            "faces_detected": face_data["face_count"],
            "faces": [
                {
                    **face,
                    "confidence": face["det_score"]  # Add confidence alias for det_score
                }
                for face in face_data["faces"]
            ],
            "processing_time_ms": face_data["processing_time_ms"]
        }
        
        response = {
            "face_detection": face_detection_response,
            "osint_results": osint_results,
            "geolocation": geolocation,
            "llm_analysis": llm_analysis,
            "confidence_score": overall_confidence,
            "processing_time": processing_time
        }
        
        # Debug logging
        logger.info(f"Response keys: {response.keys()}")
        logger.info(f"Face detection keys: {response['face_detection'].keys()}")
        if response['face_detection']['faces']:
            logger.info(f"First face keys: {response['face_detection']['faces'][0].keys()}")
        logger.info(f"Geolocation type: {type(response['geolocation'])}")
        logger.info(f"LLM analysis type: {type(response['llm_analysis'])}")
        
        return response
    except Exception as e:
        logger.error(f"Full analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
