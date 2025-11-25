"""
Geolocation Service
Extracts GPS metadata and performs visual geolocation
"""

import exiftool
from typing import Optional, Dict, Tuple
import logging
import os
import tempfile
from geopy.geocoders import Nominatim

logger = logging.getLogger(__name__)


class GeolocationService:
    """
    Handles geolocation extraction from images
    Uses ExifTool for metadata and GeoSpy for visual analysis
    """
    
    def __init__(self):
        """Initialize geolocation service"""
        self.geocoder = Nominatim(user_agent="flowsint-face-recognition")
        logger.info("Geolocation service initialized")
    
    def extract_exif_location(self, image_bytes: bytes) -> Optional[Dict]:
        """
        Extract GPS coordinates from image EXIF data
        
        Args:
            image_bytes: Image data as bytes
            
        Returns:
            Location dictionary or None if no GPS data
        """
        try:
            # Write to temporary file (exiftool needs file path)
            with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
                tmp_file.write(image_bytes)
                tmp_path = tmp_file.name
            
            try:
                # Extract EXIF data
                with exiftool.ExifToolHelper() as et:
                    metadata = et.get_metadata(tmp_path)
                
                if not metadata:
                    return None
                
                meta = metadata[0]
                
                # Look for GPS coordinates
                lat = meta.get("EXIF:GPSLatitude") or meta.get("Composite:GPSLatitude")
                lon = meta.get("EXIF:GPSLongitude") or meta.get("Composite:GPSLongitude")
                
                if not lat or not lon:
                    logger.info("No GPS data in EXIF")
                    return None
                
                # Convert to decimal if needed
                latitude = self._parse_gps_coordinate(lat)
                longitude = self._parse_gps_coordinate(lon)
                
                # Reverse geocode to get location name
                location_name = self._reverse_geocode(latitude, longitude)
                
                result = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "location_name": location_name,
                    "confidence": 1.0,  # EXIF data is 100% accurate
                    "source": "exif",
                    "metadata": {
                        "camera_make": meta.get("EXIF:Make"),
                        "camera_model": meta.get("EXIF:Model"),
                        "datetime": meta.get("EXIF:DateTimeOriginal"),
                        "altitude": meta.get("EXIF:GPSAltitude"),
                    }
                }
                
                logger.info(f"GPS extracted: {latitude}, {longitude}")
                return result
                
            finally:
                # Clean up temp file
                os.unlink(tmp_path)
                
        except Exception as e:
            logger.error(f"EXIF extraction error: {e}")
            return None
    
    def _parse_gps_coordinate(self, coord) -> float:
        """Convert GPS coordinate to decimal degrees"""
        if isinstance(coord, (int, float)):
            return float(coord)
        
        # Handle DMS format: "40 deg 44' 54.36\" N"
        if isinstance(coord, str):
            # Simple parsing (exiftool usually gives decimal already)
            try:
                # Remove direction letters
                coord = coord.replace("N", "").replace("S", "").replace("E", "").replace("W", "")
                return float(coord.strip())
            except:
                return 0.0
        
        return 0.0
    
    def _reverse_geocode(self, latitude: float, longitude: float) -> str:
        """Convert coordinates to location name"""
        try:
            location = self.geocoder.reverse(f"{latitude}, {longitude}", language="pt")
            if location:
                return location.address
            return f"{latitude}, {longitude}"
        except Exception as e:
            logger.error(f"Reverse geocoding error: {e}")
            return f"{latitude}, {longitude}"
    
    def analyze_visual_geolocation(self, image_bytes: bytes) -> Optional[Dict]:
        """
        Analyze image visually to determine location
        Uses GeoSpy API (requires API key)
        
        Args:
            image_bytes: Image data
            
        Returns:
            Location dictionary or None
        """
        try:
            geospy_api_key = os.getenv("GEOSPY_API_KEY")
            if not geospy_api_key:
                logger.warning("GEOSPY_API_KEY not configured")
                return None
            
            # TODO: Implement GeoSpy API integration
            # GeoSpy analyzes visual features like:
            # - Architecture style
            # - Vegetation type
            # - Terrain
            # - Street signs
            # - Weather patterns
            
            logger.info("Visual geolocation not yet implemented")
            return None
            
        except Exception as e:
            logger.error(f"Visual geolocation error: {e}")
            return None
    
    def get_location(self, image_bytes: bytes, use_visual: bool = True) -> Optional[Dict]:
        """
        Get location from image (tries EXIF first, then visual)
        
        Args:
            image_bytes: Image data
            use_visual: Whether to use visual analysis if EXIF fails
            
        Returns:
            Location dictionary or None
        """
        # Try EXIF first (most accurate)
        location = self.extract_exif_location(image_bytes)
        if location:
            return location
        
        # Fall back to visual analysis
        if use_visual:
            location = self.analyze_visual_geolocation(image_bytes)
            if location:
                return location
        
        logger.info("No location data available")
        return None


# Singleton instance
_geolocation_service_instance: Optional[GeolocationService] = None


def get_geolocation_service() -> GeolocationService:
    """Get or create GeolocationService singleton"""
    global _geolocation_service_instance
    if _geolocation_service_instance is None:
        _geolocation_service_instance = GeolocationService()
    return _geolocation_service_instance
