import { createFileRoute } from '@tanstack/react-router'
import { Scan, Upload, Link as LinkIcon, Search, Loader2, User, MapPin, Calendar, Mail, Phone, Globe, Facebook, Instagram, Linkedin, Twitter, Github } from 'lucide-react'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/_auth/dashboard/face-recognition')({
  component: FaceRecognitionPage
})

function FaceRecognitionPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
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
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUrlSubmit = () => {
    if (imageUrl) {
      setImagePreview(imageUrl)
    }
  }

  const handleSearch = () => {
    setIsSearching(true)
    // Simular busca (substituir com API real)
    setTimeout(() => {
      setIsSearching(false)
      setHasResults(true)
    }, 2000)
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
            
            {!hasResults ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <Scan className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Os resultados da busca aparecerão aqui
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Faça upload de uma imagem e clique em "Iniciar Reconhecimento"
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Match Score */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Precisão da Correspondência</span>
                    <span className="text-2xl font-bold text-green-500">98.7%</span>
                  </div>
                </div>

                {/* Reference Photos */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Fotos de Referência</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div key={i} className="aspect-square bg-muted rounded-lg border border-border flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-semibold mb-2">Informações Básicas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span>Nome identificado abaixo</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Localização detectada</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Perfis encontrados em múltiplas plataformas</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Detailed Results Area - Prompt Style */}
        <Card className="p-6 border-border">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="h-5 w-5 text-[#dc2638]" />
            Relatório Completo
          </h2>
          
          {!hasResults ? (
            <div className="bg-muted/50 rounded-lg p-8 text-center">
              <p className="text-muted-foreground">
                O relatório detalhado com fontes, links e dados de redes sociais aparecerá aqui após a busca
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Identity Section */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3 text-[#dc2638]">IDENTIDADE ENCONTRADA</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-semibold">John Doe Silva</p>
                      <p className="text-sm text-muted-foreground">Identificação baseada em 15 fontes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">São Paulo, SP - Brasil</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm">Idade estimada: 28-32 anos</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media Section */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3 text-[#dc2638]">REDES SOCIAIS ENCONTRADAS</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <a href="#" className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <Facebook className="h-5 w-5 text-blue-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">facebook.com/johndoe</p>
                      <p className="text-xs text-muted-foreground">2.5k seguidores</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <Instagram className="h-5 w-5 text-pink-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">@johndoe_sp</p>
                      <p className="text-xs text-muted-foreground">1.8k seguidores</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <Linkedin className="h-5 w-5 text-blue-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">linkedin.com/in/johndoe</p>
                      <p className="text-xs text-muted-foreground">500+ conexões</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <Twitter className="h-5 w-5 text-sky-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">@johndoe</p>
                      <p className="text-xs text-muted-foreground">892 seguidores</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <Github className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">github.com/johndoe</p>
                      <p className="text-xs text-muted-foreground">45 repositórios</p>
                    </div>
                  </a>
                  <a href="#" className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                    <Globe className="h-5 w-5 text-green-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">johndoe.com.br</p>
                      <p className="text-xs text-muted-foreground">Website pessoal</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* Contact Info Section */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3 text-[#dc2638]">INFORMAÇÕES DE CONTATO</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>john.doe@email.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+55 (11) 98765-4321</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span>johndoe.com.br</span>
                  </div>
                </div>
              </div>

              {/* Sources Section */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3 text-[#dc2638]">FONTES E REFERÊNCIAS</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-[#dc2638] font-mono">•</span>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Facebook Graph API:</span> Perfil público verificado em 24/11/2025
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#dc2638] font-mono">•</span>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">LinkedIn API:</span> Dados profissionais atualizados
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#dc2638] font-mono">•</span>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Google Images:</span> 12 correspondências de imagem encontradas
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#dc2638] font-mono">•</span>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">PimEyes:</span> 8 fotos públicas correspondentes
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#dc2638] font-mono">•</span>
                    <p className="text-muted-foreground">
                      <span className="font-medium text-foreground">Clearview AI:</span> Correspondência de alta confiança (98.7%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-end">
                <Button variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Exportar Relatório
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
