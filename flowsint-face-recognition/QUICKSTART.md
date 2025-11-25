# 🚀 Quick Start - Face Recognition Service

## Passo 1: Iniciar o serviço

```bash
cd flowsint-face-recognition
docker-compose up -d
```

Aguarde ~30 segundos para o InsightFace carregar os modelos.

## Passo 2: Verificar se está funcionando

```bash
curl http://localhost:8000/health
```

Resposta esperada:
```json
{
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
```

## Passo 3: Testar com uma imagem

### Opção A: Via curl
```bash
curl -X POST -F "file=@sua_foto.jpg" http://localhost:8000/api/detect
```

### Opção B: Via Python script
```bash
python test_service.py
```

### Opção C: Via Python interativo
```python
import requests

# Detectar faces
with open('sua_foto.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/detect',
        files={'file': f}
    )
    print(response.json())

# Análise completa (Face + OSINT + Geo + LLM)
with open('sua_foto.jpg', 'rb') as f:
    response = requests.post(
        'http://localhost:8000/api/analyze',
        files={'file': f}
    )
    result = response.json()
    
    print(f"Faces detectadas: {result['face_detection']['face_count']}")
    print(f"Confiança geral: {result['confidence_score']:.2%}")
    print(f"\nAnálise LLM:\n{result['llm_analysis']}")
```

## 🔍 Exemplo de resposta - Detecção facial

```json
{
  "face_count": 1,
  "faces": [
    {
      "face_id": 0,
      "bbox": [245.3, 156.8, 489.2, 523.7],
      "landmarks": [[312.4, 234.5], [398.2, 236.1], ...],
      "embedding": [0.234, -0.567, 0.123, ...],  // 512 dimensões
      "det_score": 0.9987,
      "gender": "male",
      "age": 35
    }
  ],
  "processing_time_ms": 87.4,
  "image_size": {
    "width": 1920,
    "height": 1080
  }
}
```

## 🎯 Exemplo de resposta - Análise completa

```json
{
  "face_detection": {
    "face_count": 1,
    "faces": [...],
    "processing_time_ms": 87.4
  },
  "osint_results": [
    {
      "platform": "facebook",
      "profile_url": "https://facebook.com/...",
      "confidence_score": 0.92,
      "profile_data": {
        "name": "John Doe",
        "bio": "Software Engineer",
        "location": "São Paulo, Brazil"
      }
    }
  ],
  "geolocation": {
    "latitude": -23.5505,
    "longitude": -46.6333,
    "location_name": "São Paulo, SP, Brasil",
    "confidence": 1.0,
    "source": "exif"
  },
  "llm_analysis": "## Resumo Executivo\n\nFoi detectada uma face masculina com alta confiança (99.87%). A análise de OSINT identificou um perfil no Facebook com correspondência de 92%...",
  "confidence_score": 0.93
}
```

## 🛠️ Comandos úteis

### Ver logs em tempo real
```bash
docker-compose logs -f face-recognition
```

### Parar o serviço
```bash
docker-compose down
```

### Reiniciar após mudanças no código
```bash
docker-compose restart face-recognition
```

### Rebuild completo
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Ver status dos containers
```bash
docker-compose ps
```

### Entrar no container (debug)
```bash
docker exec -it flowsint-face-recognition bash
```

## 📊 Métricas de performance

Com CPU (Intel i7):
- Detecção de face: ~80-150ms
- Embedding extraction: ~50-80ms
- Análise LLM (Gemini): ~2-5s
- Total (análise completa): ~3-6s

Com GPU (NVIDIA RTX):
- Detecção de face: ~15-30ms
- Embedding extraction: ~10-20ms
- Análise LLM: ~2-5s (não usa GPU)
- Total: ~2.5-5.5s

## 🔥 Troubleshooting

### "Service unhealthy"
```bash
# Verificar logs
docker-compose logs face-recognition

# Verificar se modelos foram baixados
docker exec flowsint-face-recognition ls -lh /root/.insightface/models/buffalo_l
```

### "GEMINI_API_KEY not provided"
```bash
# Editar .env e adicionar a key
nano .env

# Reiniciar
docker-compose restart
```

### Erro de memória (OOM)
```bash
# Reduzir det_size no .env
INSIGHTFACE_DET_SIZE=320  # ao invés de 640

# Ou aumentar memória do Docker
# Docker Desktop > Settings > Resources > Memory
```

### Face detection muito lento
```bash
# Opção 1: Reduzir qualidade
echo "INSIGHTFACE_DET_SIZE=320" >> .env

# Opção 2: Usar GPU (se disponível)
# Editar docker-compose.yml e adicionar runtime: nvidia

# Opção 3: Usar modelo mais leve
echo "INSIGHTFACE_MODEL=antelopev2" >> .env
```

## 🎓 Recursos adicionais

- **README.md** - Documentação técnica completa
- **INTEGRATION.md** - Guia de integração com FlowsInt
- **test_service.py** - Suite de testes automatizados
- [InsightFace Docs](https://github.com/deepinsight/insightface)
- [Gemini API Docs](https://ai.google.dev/docs)

## 💡 Dicas

1. **Use imagens de boa qualidade** (>640px, bem iluminadas)
2. **Faces frontais** têm melhor accuracy (>95%)
3. **Múltiplas faces** são suportadas (retorna array)
4. **EXIF GPS** tem 100% accuracy, visual ~80-95%
5. **Análise LLM** requer GEMINI_API_KEY configurada
6. **OSINT** ainda não implementado (placeholders)

---

**Pronto para usar!** 🚀

Se tiver dúvidas, consulte os arquivos de documentação ou abra um issue no GitHub.
