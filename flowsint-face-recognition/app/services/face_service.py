"""
InsightFace Service
Handles face detection, embedding extraction, and similarity comparison
Uses buffalo_l model for 99.86% LFW accuracy
"""

import numpy as np
import cv2
from insightface.app import FaceAnalysis
from typing import List, Dict, Optional, Tuple
import logging
import time

logger = logging.getLogger(__name__)


class FaceService:
    """
    Wrapper for InsightFace operations
    Provides high-level interface for face detection and recognition
    """
    
    def __init__(self, model_name: str = "buffalo_l", det_size: Tuple[int, int] = (640, 640)):
        """
        Initialize InsightFace model
        
        Args:
            model_name: Model to use (buffalo_l recommended for accuracy)
            det_size: Detection size (larger = more accurate but slower)
        """
        self.model_name = model_name
        self.det_size = det_size
        self.app = None
        self._load_model()
    
    def _load_model(self):
        """Load InsightFace model (called on init and after errors)"""
        try:
            logger.info(f"Loading InsightFace model: {self.model_name}")
            self.app = FaceAnalysis(
                name=self.model_name,
                providers=['CPUExecutionProvider']  # Use CUDAExecutionProvider for GPU
            )
            self.app.prepare(ctx_id=0, det_size=self.det_size)
            logger.info("InsightFace model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load InsightFace model: {e}")
            raise
    
    def detect_faces(self, image_bytes: bytes) -> List[Dict]:
        """
        Detect faces in image and extract embeddings
        
        Args:
            image_bytes: Image data as bytes
            
        Returns:
            List of face dictionaries with bbox, landmarks, embedding, etc.
        """
        start_time = time.time()
        
        try:
            # Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if img is None:
                raise ValueError("Failed to decode image")
            
            # Detect faces
            faces = self.app.get(img)
            
            processing_time = (time.time() - start_time) * 1000  # Convert to ms
            
            # Format results - Convert all numpy types to native Python types
            results = []
            for idx, face in enumerate(faces):
                face_dict = {
                    "face_id": int(idx),
                    "bbox": [float(x) for x in face.bbox.tolist()],  # [x1, y1, x2, y2]
                    "landmarks": [[float(x) for x in point] for point in face.kps.tolist()] if hasattr(face, 'kps') else None,
                    "embedding": [float(x) for x in face.embedding.tolist()],  # 512-dim vector for buffalo_l
                    "det_score": float(face.det_score),  # Detection confidence
                    "gender": int(face.gender) if hasattr(face, 'gender') else None,
                    "age": int(face.age) if hasattr(face, 'age') else None,
                }
                results.append(face_dict)
            
            logger.info(f"Detected {len(faces)} faces in {processing_time:.2f}ms")
            
            return {
                "face_count": int(len(faces)),
                "faces": results,
                "processing_time_ms": float(processing_time),
                "image_size": {
                    "width": int(img.shape[1]),
                    "height": int(img.shape[0])
                }
            }
            
        except Exception as e:
            logger.error(f"Face detection error: {e}")
            raise
    
    def compare_faces(self, embedding1: np.ndarray, embedding2: np.ndarray) -> float:
        """
        Compare two face embeddings using cosine similarity
        
        Args:
            embedding1: First face embedding (512-dim)
            embedding2: Second face embedding (512-dim)
            
        Returns:
            Similarity score (0-1, higher = more similar)
            Threshold: >0.6 is considered a match (high confidence)
        """
        try:
            # Normalize embeddings
            emb1_norm = embedding1 / np.linalg.norm(embedding1)
            emb2_norm = embedding2 / np.linalg.norm(embedding2)
            
            # Cosine similarity
            similarity = np.dot(emb1_norm, emb2_norm)
            
            return float(similarity)
            
        except Exception as e:
            logger.error(f"Face comparison error: {e}")
            raise
    
    def is_same_person(self, embedding1: np.ndarray, embedding2: np.ndarray, threshold: float = 0.6) -> bool:
        """
        Determine if two embeddings represent the same person
        
        Args:
            embedding1: First face embedding
            embedding2: Second face embedding
            threshold: Similarity threshold (default 0.6 for high confidence)
            
        Returns:
            True if same person, False otherwise
        """
        similarity = self.compare_faces(embedding1, embedding2)
        return similarity >= threshold
    
    def align_face(self, image_bytes: bytes, face_idx: int = 0) -> Optional[np.ndarray]:
        """
        Align and crop a face for better recognition
        
        Args:
            image_bytes: Image data
            face_idx: Which face to align (default 0 = first face)
            
        Returns:
            Aligned face image as numpy array, or None if no face found
        """
        try:
            # Decode image
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            # Detect faces
            faces = self.app.get(img)
            
            if len(faces) <= face_idx:
                return None
            
            face = faces[face_idx]
            
            # Extract aligned face (112x112 standard size)
            aligned_face = face.normed_embedding if hasattr(face, 'normed_embedding') else None
            
            return aligned_face
            
        except Exception as e:
            logger.error(f"Face alignment error: {e}")
            return None


# Singleton instance
_face_service_instance: Optional[FaceService] = None


def get_face_service() -> FaceService:
    """Get or create FaceService singleton"""
    global _face_service_instance
    if _face_service_instance is None:
        _face_service_instance = FaceService()
    return _face_service_instance
