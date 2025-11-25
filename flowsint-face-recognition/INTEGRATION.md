# FlowsInt Face Recognition - Integration Guide

## 🚀 Início Rápido

### 1. Build e Start
```bash
cd flowsint-face-recognition
docker-compose up -d
```

### 2. Verificar Health
```bash
curl http://localhost:8000/health
```

### 3. Testar Face Detection
```bash
# Com uma imagem local
curl -X POST -F "file=@test_image.jpg" http://localhost:8000/api/detect

# Ou use o script de teste Python
python test_service.py
```

---

## 📡 Integração com FlowsInt API

### Passo 1: Adicionar proxy endpoint na API principal

**Arquivo**: `flowsint-api/app/api/routes/face_recognition.py` (criar novo)

```python
from fastapi import APIRouter, UploadFile, File, HTTPException
import httplib2
import requests
from typing import List

router = APIRouter()

FACE_RECOGNITION_SERVICE = "http://localhost:8000"

@router.post("/analyze")
async def analyze_face(file: UploadFile = File(...)):
    """
    Proxy para o serviço de reconhecimento facial
    Faz upload da imagem e retorna análise completa
    """
    try:
        # Read file
        contents = await file.read()
        
        # Forward to Face Recognition service
        files = {'file': (file.filename, contents, file.content_type)}
        response = requests.post(
            f"{FACE_RECOGNITION_SERVICE}/api/analyze",
            files=files,
            timeout=60  # Face analysis pode demorar
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
```

### Passo 2: Registrar rota no main.py

**Arquivo**: `flowsint-api/app/main.py`

```python
from app.api.routes import face_recognition

# ... existing code ...

app.include_router(
    face_recognition.router,
    prefix="/api/face-recognition",
    tags=["face-recognition"]
)
```

### Passo 3: Atualizar frontend

**Arquivo**: `flowsint-app/src/routes/_auth.dashboard.face-recognition.tsx`

Substituir o `handleSearch` com chamada real à API:

```typescript
const handleSearch = async () => {
  if (!uploadedFile && !imageUrl) return

  setIsSearching(true)
  setHasResults(false)

  try {
    const formData = new FormData()
    
    if (uploadedFile) {
      formData.append('file', uploadedFile)
    } else if (imageUrl) {
      // Download da URL e adicionar ao FormData
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      formData.append('file', blob, 'image.jpg')
    }

    // Chamar API do FlowsInt (que faz proxy para Face Recognition)
    const response = await fetch('/api/face-recognition/analyze', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    if (!response.ok) {
      throw new Error('Analysis failed')
    }

    const data = await response.json()
    
    // Atualizar UI com resultados reais
    setHasResults(true)
    console.log('Analysis results:', data)
    
    // TODO: Renderizar resultados na UI
    // - data.face_detection.faces (faces detectadas)
    // - data.osint_results (perfis sociais)
    // - data.geolocation (localização)
    // - data.llm_analysis (análise da LLM)
    
  } catch (error) {
    console.error('Search error:', error)
    // Show error to user
  } finally {
    setIsSearching(false)
  }
}
```

---

## 🔧 Configuração de Produção

### Deploy no VPS (31.97.83.205)

1. **Copiar arquivos para servidor**:
```bash
scp -r flowsint-face-recognition root@31.97.83.205:/root/
```

2. **Conectar ao servidor e build**:
```bash
ssh root@31.97.83.205
cd /root/flowsint-face-recognition
docker-compose build
```

3. **Configurar variáveis de ambiente**:
```bash
nano .env
# Adicionar GEMINI_API_KEY real
# Adicionar outras API keys se necessário
```

4. **Iniciar serviço**:
```bash
docker-compose up -d
```

5. **Verificar logs**:
```bash
docker-compose logs -f face-recognition
```

6. **Configurar Nginx para proxy**:

Adicionar ao `nginx.conf` no servidor:

```nginx
# Face Recognition API
location /api/face-recognition/ {
    proxy_pass http://localhost:8000/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    
    # Aumentar timeouts para análise demorada
    proxy_connect_timeout 120s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;
    
    # Aumentar limite de upload (para imagens grandes)
    client_max_body_size 20M;
}
```

7. **Reload Nginx**:
```bash
nginx -t
systemctl reload nginx
```

---

## 📊 Monitoramento

### Verificar status dos containers
```bash
docker ps | grep face-recognition
```

### Ver logs em tempo real
```bash
docker-compose logs -f
```

### Verificar consumo de recursos
```bash
docker stats flowsint-face-recognition
```

### Testar endpoint de produção
```bash
curl https://rsl.scarletredsolutions.com/api/face-recognition/health
```

---

## 🔐 Segurança

### Limitar acesso apenas para admins

No backend (`flowsint-api/app/api/routes/face_recognition.py`):

```python
from app.security.auth import get_current_user
from app.models.user import User

admin_emails = [
    "lucas.oliveira@scarletredsolutions.com",
    "rafaelmcpsouza@hotmail.com",
    "leandroaugustomiranda761@gmail.com"
]

@router.post("/analyze")
async def analyze_face(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    # Check if user is admin
    if current_user.email not in admin_emails:
        raise HTTPException(
            status_code=403,
            detail="Face Recognition is only available for administrators"
        )
    
    # ... resto do código ...
```

---

## ⚡ Performance

### Otimizações recomendadas:

1. **Adicionar Redis cache** para embeddings faciais
2. **Usar GPU** se disponível (trocar `CPUExecutionProvider` por `CUDAExecutionProvider`)
3. **Implementar queue system** com Celery para processamento assíncrono
4. **Adicionar rate limiting** para evitar abuse

### Com GPU (se disponível):

Modificar `app/services/face_service.py`:

```python
self.app = FaceAnalysis(
    name=self.model_name,
    providers=['CUDAExecutionProvider', 'CPUExecutionProvider']  # GPU primeiro
)
```

E atualizar `docker-compose.yml`:

```yaml
face-recognition:
  # ... existing config ...
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
```

---

## 🐛 Troubleshooting

### Erro: "Service unhealthy"
- Verificar se modelos foram baixados: `docker exec -it flowsint-face-recognition ls /root/.insightface`
- Verificar logs: `docker-compose logs face-recognition`

### Erro: "GEMINI_API_KEY not provided"
- Adicionar chave no arquivo `.env`
- Reiniciar container: `docker-compose restart`

### Face detection muito lento
- Reduzir `INSIGHTFACE_DET_SIZE` no `.env` (de 640 para 320)
- Considerar usar GPU

### OSINT não retorna resultados
- Social Mapper ainda não implementado (placeholders)
- Implementar integração com APIs das redes sociais

---

## 📚 Próximos Passos

1. ✅ Implementar integração com API principal
2. ⏳ Adicionar Social Mapper para OSINT real
3. ⏳ Integrar GeoSpy API para geolocalização visual
4. ⏳ Adicionar cache Redis para embeddings
5. ⏳ Implementar queue com Celery
6. ⏳ Adicionar interface web para visualizar resultados
7. ⏳ Implementar export de relatórios (PDF/JSON)

---

## 📞 Suporte

Para questões ou problemas:
- Email: lucas.oliveira@scarletredsolutions.com
- GitHub Issues: (adicionar link do repo)
