"""
Face Recognition Routes
Proxy endpoints for the Face Recognition microservice
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import requests
import logging
from typing import List, Optional

from flowsint_core.core.models import Profile
from app.api.deps import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

# Face Recognition service URL (internal Docker network)
FACE_RECOGNITION_SERVICE = "http://flowsint-face-recognition:8000"

# Admin emails (only these users can access face recognition)
ADMIN_EMAILS = [
    "lucas.oliveira@scarletredsolutions.com",
    "rafaelmcpsouza@hotmail.com",
    "leandroaugustomiranda761@gmail.com",
    "douglasmunizdutra@gmail.com"
]


def check_admin_access(current_user: Profile):
    """Check if user has admin access to face recognition"""
    if current_user.email not in ADMIN_EMAILS:
        raise HTTPException(
            status_code=403,
            detail="Face Recognition is only available for administrators"
        )


@router.post("/detect")
async def detect_faces(
    file: UploadFile = File(...),
    current_user: Profile = Depends(get_current_user)
):
    """
    Detect faces in uploaded image
    Returns face count, bounding boxes, and embeddings
    
    Admin only endpoint
    """
    check_admin_access(current_user)
    
    try:
        logger.info(f"Face detection requested by {current_user.email}")
        
        # Read file
        contents = await file.read()
        
        # Forward to Face Recognition service
        files = {'file': (file.filename, contents, file.content_type)}
        response = requests.post(
            f"{FACE_RECOGNITION_SERVICE}/api/detect",
            files=files,
            timeout=30
        )
        
        if response.status_code != 200:
            logger.error(f"Face Recognition service error: {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Face detection failed: {response.text}"
            )
        
        result = response.json()
        logger.info(f"Detected {result['face_count']} faces in {result['processing_time_ms']:.2f}ms")
        
        return result
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Face Recognition service unavailable: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Face Recognition service unavailable: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Face detection error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal error: {str(e)}"
        )


@router.post("/geolocate")
async def geolocate_image(
    file: UploadFile = File(...),
    current_user: Profile = Depends(get_current_user)
):
    """
    Extract geolocation from image metadata or visual analysis
    Returns GPS coordinates, location name, and confidence
    
    Admin only endpoint
    """
    check_admin_access(current_user)
    
    try:
        logger.info(f"Geolocation requested by {current_user.email}")
        
        # Read file
        contents = await file.read()
        
        # Forward to Face Recognition service
        files = {'file': (file.filename, contents, file.content_type)}
        response = requests.post(
            f"{FACE_RECOGNITION_SERVICE}/api/geolocate",
            files=files,
            timeout=30
        )
        
        if response.status_code != 200:
            logger.error(f"Geolocation service error: {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Geolocation failed: {response.text}"
            )
        
        result = response.json()
        
        if result['latitude'] and result['longitude']:
            logger.info(f"Location found: {result['location_name']}")
        else:
            logger.info("No location data found in image")
        
        return result
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Geolocation service unavailable: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Geolocation service unavailable: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Geolocation error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal error: {str(e)}"
        )


@router.post("/analyze")
async def analyze_face(
    file: UploadFile = File(...),
    search_platforms: Optional[List[str]] = None,
    current_user: Profile = Depends(get_current_user)
):
    """
    Complete facial recognition + OSINT + geolocation + LLM analysis
    This is the main endpoint that orchestrates all services
    
    Returns:
    - face_detection: Face count, bounding boxes, embeddings, age, gender
    - osint_results: Social media profiles found (if any)
    - geolocation: GPS coordinates and location name (if available)
    - llm_analysis: Contextual analysis report from Gemini API
    - confidence_score: Overall confidence (0-1)
    
    Admin only endpoint
    """
    check_admin_access(current_user)
    
    try:
        logger.info(f"Full analysis requested by {current_user.email}")
        
        # Read file
        contents = await file.read()
        
        # Prepare request
        files = {'file': (file.filename, contents, file.content_type)}
        params = {}
        if search_platforms:
            params['search_platforms'] = search_platforms
        
        # Forward to Face Recognition service
        response = requests.post(
            f"{FACE_RECOGNITION_SERVICE}/api/analyze",
            files=files,
            params=params,
            timeout=120  # Analysis can take longer due to LLM
        )
        
        if response.status_code != 200:
            logger.error(f"Analysis service error: {response.text}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Analysis failed: {response.text}"
            )
        
        result = response.json()
        
        logger.info(
            f"Analysis complete: {result['face_detection']['face_count']} faces, "
            f"{len(result['osint_results'])} OSINT matches, "
            f"confidence: {result['confidence_score']:.2%}"
        )
        
        return result
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Analysis service unavailable: {e}")
        raise HTTPException(
            status_code=503,
            detail=f"Analysis service unavailable: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal error: {str(e)}"
        )


@router.get("/health")
async def face_recognition_health():
    """
    Check Face Recognition service health
    No authentication required
    """
    try:
        response = requests.get(
            f"{FACE_RECOGNITION_SERVICE}/health",
            timeout=5
        )
        
        if response.status_code == 200:
            return {
                "status": "healthy",
                "service": response.json()
            }
        else:
            return {
                "status": "unhealthy",
                "error": response.text
            }
    except Exception as e:
        return {
            "status": "unavailable",
            "error": str(e)
        }
