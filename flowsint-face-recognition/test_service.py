#!/usr/bin/env python3
"""
Test script for Face Recognition service
Tests all endpoints with sample data
"""

import requests
import json
import sys
from pathlib import Path

# Service URL
BASE_URL = "http://localhost:8000"

def test_health():
    """Test health check endpoint"""
    print("🔍 Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed:")
            print(f"   Status: {data['status']}")
            print(f"   Services: {json.dumps(data['services'], indent=2)}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

def test_face_detection(image_path: str):
    """Test face detection endpoint"""
    print(f"\n🔍 Testing face detection with {image_path}...")
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{BASE_URL}/api/detect", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Face detection passed:")
            print(f"   Faces detected: {data['face_count']}")
            print(f"   Processing time: {data['processing_time_ms']:.2f}ms")
            
            if data['face_count'] > 0:
                face = data['faces'][0]
                print(f"   First face:")
                print(f"     - Detection score: {face['det_score']:.3f}")
                print(f"     - Age: {face.get('age', 'N/A')}")
                print(f"     - Gender: {face.get('gender', 'N/A')}")
            return True
        else:
            print(f"❌ Face detection failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except FileNotFoundError:
        print(f"❌ Image file not found: {image_path}")
        return False
    except Exception as e:
        print(f"❌ Face detection error: {e}")
        return False

def test_geolocation(image_path: str):
    """Test geolocation endpoint"""
    print(f"\n🔍 Testing geolocation with {image_path}...")
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{BASE_URL}/api/geolocate", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Geolocation passed:")
            if data['latitude'] and data['longitude']:
                print(f"   Location: {data['location_name']}")
                print(f"   Coordinates: {data['latitude']}, {data['longitude']}")
                print(f"   Source: {data['source']}")
                print(f"   Confidence: {data['confidence']:.2%}")
            else:
                print(f"   No location data found in image")
            return True
        else:
            print(f"❌ Geolocation failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Geolocation error: {e}")
        return False

def test_full_analysis(image_path: str):
    """Test full analysis endpoint (Face + OSINT + Geo + LLM)"""
    print(f"\n🔍 Testing full analysis with {image_path}...")
    try:
        with open(image_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(f"{BASE_URL}/api/analyze", files=files)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Full analysis passed:")
            print(f"   Faces detected: {data['face_detection']['face_count']}")
            print(f"   OSINT matches: {len(data['osint_results'])}")
            print(f"   Overall confidence: {data['confidence_score']:.2%}")
            
            if data['llm_analysis']:
                print(f"\n   📝 LLM Analysis (first 500 chars):")
                print(f"   {data['llm_analysis'][:500]}...")
            
            return True
        else:
            print(f"❌ Full analysis failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Full analysis error: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 Face Recognition Service Test Suite")
    print("=" * 60)
    
    # Test health first
    if not test_health():
        print("\n❌ Service is not healthy. Please check logs.")
        sys.exit(1)
    
    # Check for test image
    test_image = "test_image.jpg"
    if not Path(test_image).exists():
        print(f"\n⚠️  No test image found: {test_image}")
        print("   Please provide a test image with a face to test face detection")
        print("\n✅ Health check passed - service is running!")
        sys.exit(0)
    
    # Run face detection test
    test_face_detection(test_image)
    
    # Run geolocation test (will work only if image has GPS metadata)
    test_geolocation(test_image)
    
    # Run full analysis test (requires GEMINI_API_KEY in .env)
    test_full_analysis(test_image)
    
    print("\n" + "=" * 60)
    print("✅ All tests completed!")
    print("=" * 60)

if __name__ == "__main__":
    main()
