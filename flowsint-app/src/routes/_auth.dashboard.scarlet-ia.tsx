import { createFileRoute } from '@tanstack/react-router'
import { Brain, ExternalLink, Shield, Search, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/_auth/dashboard/scarlet-ia')({
  component: ScarletIAPage
})

const USER_CODE = '548420691424'
const SKYNET_URL = 'https://skynetchat.net/'

function ScarletIAPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleOpenExternal = () => {
    window.open(SKYNET_URL, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">Scarlet-IA</h1>
                  <Badge variant="outline" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                    <Sparkles className="w-3 h-3 mr-1" />
                    ADMIN
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Inteligência Artificial OSINT com recursos Deep Search
                </p>
              </div>
            </div>
            
            <button
              onClick={handleOpenExternal}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm font-medium">Abrir em Nova Aba</span>
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="border-purple-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-purple-500" />
                  <CardTitle className="text-sm">Deep Search OSINT</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">
                  Busca profunda em múltiplas fontes de dados públicos e privados
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-500" />
                  <CardTitle className="text-sm">IA Avançada</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">
                  Análise inteligente com modelos de linguagem de última geração
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-green-500/20">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  <CardTitle className="text-sm">Acesso Seguro</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs">
                  Código de acesso PRO: {USER_CODE}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content - Iframe */}
      <div className="flex-1 relative bg-muted/30">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
            <div className="text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-purple-500/30"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin"></div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Carregando Scarlet-IA...</p>
                <p className="text-xs text-muted-foreground">Conectando ao SkynetChat</p>
              </div>
            </div>
          </div>
        )}
        
        <iframe
          ref={iframeRef}
          src={SKYNET_URL}
          className="w-full h-full border-0"
          title="Scarlet-IA powered by SkynetChat"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
          onLoad={() => setIsLoading(false)}
        />
      </div>

      {/* Footer Info */}
      <div className="border-t bg-card">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-3 h-3" />
              <span>Código de Acesso PRO: <code className="px-2 py-0.5 rounded bg-muted font-mono">{USER_CODE}</code></span>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3 h-3" />
              <a 
                href={SKYNET_URL} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                skynetchat.net
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
