#!/usr/bin/env python3
"""
Download sample test images for Face Recognition service
"""

import requests
import os
from pathlib import Path

SAMPLE_IMAGES = {
    "person1.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Cat03.jpg/1200px-Cat03.jpg",
    "person2.jpg": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Albert_Einstein_%281947%29.jpg/800px-Albert_Einstein_%281947%29.jpg",
}

def download_sample_images():
    """Download sample images for testing"""
    test_images_dir = Path("test_images")
    test_images_dir.mkdir(exist_ok=True)
    
    print("📥 Downloading sample test images...")
    
    for filename, url in SAMPLE_IMAGES.items():
        filepath = test_images_dir / filename
        
        if filepath.exists():
            print(f"  ✅ {filename} already exists")
            continue
        
        print(f"  ⏳ Downloading {filename}...")
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"  ✅ {filename} downloaded")
        except Exception as e:
            print(f"  ❌ Failed to download {filename}: {e}")
    
    print("\n✅ Sample images ready in test_images/")
    print("   Use these images to test the Face Recognition service:")
    print(f"   curl -X POST -F 'file=@test_images/person1.jpg' http://localhost:8000/api/detect")

if __name__ == "__main__":
    download_sample_images()
