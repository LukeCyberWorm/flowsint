# FlowsInt Face Recognition System

Sistema de reconhecimento facial com ≥99% de precisão usando InsightFace, busca reversa em redes sociais e geolocalização por metadados.

## Componentes Principais

### 1. Core de Reconhecimento Facial
- **InsightFace**: Detecção e extração de embeddings (99.86% no LFW)
- **RetinaFace**: Detecção de faces robusta
- **ArcFace**: Embeddings de alta precisão

### 2. Busca Online em Redes Sociais
- **Social Mapper**: Busca reversa em Facebook, Twitter/X, LinkedIn, Instagram
- **PimEyes Integration** (opcional): API paga para busca reversa
- **Lenso.ai** (opcional): API gratuita para casos básicos

### 3. Geolocalização por Metadados
- **ExifTool**: Extração de GPS/EXIF de imagens
- **GeoSpy + Gemini API**: Geolocalização por análise visual (arquitetura, solo, vegetação)

### 4. LLM para Análise e Relatórios
- **Gemini API**: Análise contextual de perfis e geração de relatórios
- **GPT-4 Vision** (alternativa): Análise de imagens e contexto

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway (FastAPI)                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────────┐
│  Face Service  │  │  OSINT Service  │
│  (InsightFace) │  │  (Social Mapper)│
└───────┬────────┘  └──────┬──────────┘
        │                   │
        └─────────┬─────────┘
                  │
        ┌─────────▼──────────┐
        │   Geoloc Service   │
        │ (ExifTool+GeoSpy) │
        └─────────┬──────────┘
                  │
        ┌─────────▼──────────┐
        │    LLM Service     │
        │   (Gemini API)     │
        └────────────────────┘
```

## Stack Tecnológica

- **Python 3.11+**
- **FastAPI** - API REST
- **InsightFace** - Reconhecimento facial
- **OpenCV** - Processamento de imagem
- **ExifTool** - Metadados
- **Redis** - Cache de embeddings
- **PostgreSQL** - Armazenamento de resultados
- **Docker + Kubernetes** - Orquestração

## Precisão Esperada

- **Reconhecimento Facial**: ≥99% (LFW benchmark)
- **Match Online**: 95-98% (perfis públicos)
- **Geolocalização**: 95-98% (com GPS), 90-95% (análise visual)

## Considerações Éticas

⚠️ **USO APENAS PARA FINS LEGAIS**:
- Investigações autorizadas
- Jornalismo investigativo
- Pesquisa acadêmica

🚫 **PROIBIDO**:
- Stalking
- Vigilância não autorizada
- Violação de privacidade

## Conformidade Legal

- **LGPD** (Brasil)
- **GDPR** (Europa)
- Apenas perfis públicos
- Respeito aos termos de serviço das plataformas
