#!/bin/bash
# Cria o arquivo face_recognition.py no container em produção

docker exec -i flowsint-api-prod bash -c 'cat > /app/flowsint-api/app/api/routes/face_recognition.py' <<'EOFPYTHON'
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import requests
from typing import List
from app.security.auth import get_current_user

router = APIRouter()

FACE_RECOGNITION_SERVICE = "http://localhost:8000"

admin_emails = [
    "lucas.oliveira@scarletredsolutions.com",
    "rafaelmcpsouza@hotmail.com",
    "leandroaugustomiranda761@gmail.com"
]

@router.post("/analyze")
async def analyze_face(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """
    Analyze face in uploaded image
    Only available for administrators
    """
    if current_user.email not in admin_emails:
        raise HTTPException(
            status_code=403,
            detail="Face Recognition is only available for administrators"
        )
    
    try:
        contents = await file.read()
        files = {'file': (file.filename, contents, file.content_type)}
        response = requests.post(
            f"{FACE_RECOGNITION_SERVICE}/api/analyze",
            files=files,
            timeout=60
        )
        
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Face Recognition service error: {response.text}"
            )
        
        return response.json()
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=503,
            detail=f"Face Recognition service unavailable: {str(e)}"
        )

@router.get("/health")
async def health_check():
    """Check Face Recognition service health"""
    try:
        response = requests.get(f"{FACE_RECOGNITION_SERVICE}/health", timeout=5)
        return response.json()
    except:
        raise HTTPException(status_code=503, detail="Face Recognition service unavailable")
EOFPYTHON

echo "✅ face_recognition.py criado com sucesso"

# Adiciona import no main.py se não existir
docker exec flowsint-api-prod bash -c "grep -q 'face_recognition' /app/flowsint-api/app/main.py || sed -i '/from app.api.routes import/a from app.api.routes import face_recognition' /app/flowsint-api/app/main.py"

# Adiciona router no main.py se não existir  
docker exec flowsint-api-prod bash -c "grep -q 'face-recognition' /app/flowsint-api/app/main.py || sed -i '/app.include_router(auth.router/a app.include_router(\n    face_recognition.router,\n    prefix=\"/api/face-recognition\",\n    tags=[\"face-recognition\"]\n)' /app/flowsint-api/app/main.py"

echo "✅ Rotas registradas no main.py"

# Restart API container
docker restart flowsint-api-prod

echo "✅ API reiniciada com sucesso"
