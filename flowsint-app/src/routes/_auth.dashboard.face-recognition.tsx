import { createFileRoute } from '@tanstack/react-router'
import { Scan, Upload, Link as LinkIcon, Search, Loader2, User, MapPin, Calendar, Mail, Phone, Globe, Facebook, Instagram, Linkedin, Twitter, Github, AlertCircle } from 'lucide-react'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchWithAuth } from '@/api/api'

export const Route = createFileRoute('/_auth/dashboard/face-recognition')({
  component: FaceRecognitionPage
})

interface FaceDetection {
  faces_detected: number
  faces: Array<{
    bbox: number[]
    confidence: number
    age: number
    gender: string
    embedding: number[]
  }>
}

interface GeolocationData {
  coordinates?: {
    latitude: number
    longitude: number
  }
  location_name?: string
  confidence?: number
}

interface OSINTResult {
  platforms: Record<string, any>
}

interface AnalysisResult {
  face_detection: FaceDetection
  geolocation?: GeolocationData
  osint_results?: OSINTResult
  llm_analysis: {
    profile_summary: string
    risk_assessment: string
    recommendations: string[]
  }
  processing_time: number
}

function FaceRecognitionPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [results, setResults] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadedFileRef = useRef<File | null>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadedFileRef.current = file
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setError(null)
        setResults(null)
        setHasResults(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      uploadedFileRef.current = file
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setError(null)
        setResults(null)
        setHasResults(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlSubmit = () => {
    if (imageUrl) {
      setImagePreview(imageUrl)
    }
  }

  const handleSearch = async () => {
    if (!uploadedFileRef.current) {
      setError("Nenhuma imagem foi carregada. Por favor, faça upload de uma imagem.")
      return
    }

    setIsSearching(true)
    setError(null)
    setResults(null)
    setHasResults(false)

    try {
      const formData = new FormData()
      formData.append('file', uploadedFileRef.current)

      const response = await fetchWithAuth('/api/face-recognition/analyze', {
        method: 'POST',
        body: formData
      })

      setResults(response)
      setHasResults(true)
    } catch (err: any) {
      console.error('Erro ao analisar imagem:', err)
      const errorMessage = err.message || 'Erro desconhecido ao processar a imagem'
      setError(errorMessage)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="h-full w-full bg-background overflow-y-auto">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Scan className="h-8 w-8 text-[#dc2638]" strokeWidth={1.5} />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ff4b5c] to-[#d72638] bg-clip-text text-transparent">
              Face Recognition
            </h1>
            <span className="text-xs bg-[#dc2638]/20 text-[#dc2638] px-2 py-1 rounded-full">ADMIN</span>
          </div>
          <p className="text-muted-foreground">
            Sistema de reconhecimento facial com busca precisa em múltiplas fontes
          </p>
        </div>

        {/* Main Grid - Upload e Resultados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Upload Area */}
          <Card className="p-6 border-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-[#dc2638]" />
              Upload de Imagem
            </h2>
            
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="upload">Upload/Arrastar</TabsTrigger>
                <TabsTrigger value="url">URL da Imagem</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload">
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-[#dc2638] transition-colors"
                >
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-64 mx-auto rounded-lg"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="mt-4"
                        onClick={(e) => {
                          e.stopPropagation()
                          setImagePreview(null)
                        }}
                      >
                        Remover Imagem
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Clique para fazer upload ou arraste a imagem</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG até 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </TabsContent>
              
              <TabsContent value="url">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleUrlSubmit} variant="secondary">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {imagePreview && (
                    <div className="border border-border rounded-lg p-4">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="max-h-64 mx-auto rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleSearch}
              disabled={!imagePreview || isSearching}
              className="w-full mt-6 bg-[#dc2638] hover:bg-[#d72638]"
            >
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Iniciar Reconhecimento
                </>
              )}
            </Button>
          </Card>

          {/* Results Area */}
          <Card className="p-6 border-border">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-[#dc2638]" />
              Resultados da Busca
            </h2>
            
            {error ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <AlertCircle className="h-16 w-16 text-destructive/50 mb-4" />
                <p className="text-destructive font-medium mb-2">Erro no processamento</p>
                <p className="text-sm text-muted-foreground max-w-md">{error}</p>
              </div>
            ) : !hasResults ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <Scan className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Os resultados da busca aparecerão aqui
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Faça upload de uma imagem e clique em "Iniciar Reconhecimento"
                </p>
              </div>
            ) : results ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {/* Face Detection Results */}
                <div className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-[#dc2638]" />
                    Detecção Facial
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Faces detectadas:</span>
                      <span className="font-medium">{results.face_detection.faces_detected}</span>
                    </div>
                    {results.face_detection.faces.map((face, idx) => (
                      <div key={idx} className="pl-4 border-l-2 border-[#dc2638]/20 mt-2">
                        <p className="font-medium mb-1">Face {idx + 1}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Idade:</span>{' '}
                            <span>{face.age} anos</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Gênero:</span>{' '}
                            <span>{face.gender === 'M' ? 'Masculino' : 'Feminino'}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Confiança:</span>{' '}
                            <span>{(face.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Geolocation Results */}
                {results.geolocation && (results.geolocation.coordinates?.latitude || results.geolocation.location_name) && (
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#dc2638]" />
                      Geolocalização
                    </h3>
                    <div className="space-y-2 text-sm">
                      {results.geolocation.coordinates?.latitude != null && results.geolocation.coordinates?.longitude != null && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Coordenadas:</span>
                          <span className="font-mono text-xs">
                            {results.geolocation.coordinates.latitude.toFixed(6)}, {results.geolocation.coordinates.longitude.toFixed(6)}
                          </span>
                        </div>
                      )}
                      {results.geolocation.location_name && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Local:</span>
                          <span>{results.geolocation.location_name}</span>
                        </div>
                      )}
                      {results.geolocation.confidence != null && results.geolocation.confidence > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confiança:</span>
                          <span>{(results.geolocation.confidence * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Processing Time */}
                {results.processing_time != null && (
                  <div className="text-xs text-muted-foreground text-center pt-2">
                    Processado em {results.processing_time.toFixed(2)} segundos
                  </div>
                )}
              </div>
            ) : null}
          </Card>
        </div>

        {/* Detailed Results Area - Prompt Style */}
        <Card className="p-6 border-border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-[#dc2638]" />
            Relatório Completo
          </h2>
          
          {!hasResults || !results ? (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                O relatório detalhado com fontes, links e dados de redes sociais aparecerá aqui após a busca
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* LLM Analysis */}
              {results.llm_analysis && (
                <div className="space-y-4">
                  {/* Profile Summary */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <User className="h-4 w-4 text-[#dc2638]" />
                      Resumo do Perfil
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {results.llm_analysis.profile_summary}
                    </p>
                  </div>

                  {/* Risk Assessment */}
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-[#dc2638]" />
                      Avaliação de Risco
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {results.llm_analysis.risk_assessment}
                    </p>
                  </div>

                  {/* Recommendations */}
                  {results.llm_analysis.recommendations && results.llm_analysis.recommendations.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4">
                      <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Search className="h-4 w-4 text-[#dc2638]" />
                        Recomendações
                      </h3>
                      <ul className="space-y-2">
                        {results.llm_analysis.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                            <span className="text-[#dc2638] mt-1">•</span>
                            <span className="flex-1">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* OSINT Results (if available) */}
              {results.osint_results && Array.isArray(results.osint_results) && results.osint_results.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#dc2638]" />
                    Perfis Encontrados
                  </h3>
                  <div className="space-y-2">
                    {results.osint_results.map((result: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="capitalize">{result.platform}</span>
                        <a 
                          href={result.profile_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#dc2638] hover:underline flex items-center gap-1"
                        >
                          Ver perfil
                          <span className="text-xs text-muted-foreground">({(result.confidence_score * 100).toFixed(0)}%)</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
