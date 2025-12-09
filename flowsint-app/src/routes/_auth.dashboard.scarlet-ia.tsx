import { createFileRoute } from '@tanstack/react-router'
import { 
  Brain, Send, FileText, Download, Save, Trash2, 
  Sparkles, Loader2, FolderOpen, MessageSquare, 
  ChevronRight, Search, Users, Globe, FileSearch,
  Workflow, Database, AlertCircle, CheckCircle2,
  Clock, Eye, PlusCircle, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useEffect, useRef, useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { fetchWithAuth } from '@/api/api'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const Route = createFileRoute('/_auth/dashboard/scarlet-ia')({
  component: ScarletIAPage
})

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  tools_used?: string[]
  attachments?: Array<{ type: string; data: any }>
}

interface Note {
  id: string
  content: string
  created_at: Date
  updated_at: Date
  tags: string[]
}

interface Investigation {
  id: string
  name: string
  description: string
  created_at: string
}

const TOOLS_AVAILABLE = [
  { id: 'flow_create', name: 'Criar Flow', icon: Workflow, description: 'Criar flows automatizados' },
  { id: 'domain_search', name: 'Busca de Domínio', icon: Globe, description: 'Pesquisar informações de domínios' },
  { id: 'person_search', name: 'Busca de Pessoas', icon: Users, description: 'Investigar informações pessoais' },
  { id: 'osint_search', name: 'OSINT Search', icon: Search, description: 'Busca deep em fontes abertas' },
  { id: 'data_analysis', name: 'Análise de Dados', icon: Database, description: 'Analisar dados do caso' },
  { id: 'face_recognition', name: 'Reconhecimento Facial', icon: Eye, description: 'Análise facial e geolocalização' },
  { id: 'kali_nmap', name: 'Nmap', icon: Search, description: 'Port scanning e descoberta de rede' },
  { id: 'kali_metasploit', name: 'Metasploit', icon: Database, description: 'Framework de penetração' },
  { id: 'kali_burp', name: 'Burp Suite', icon: Globe, description: 'Análise de aplicações web' },
  { id: 'kali_wireshark', name: 'Wireshark', icon: Eye, description: 'Análise de tráfego de rede' },
  { id: 'kali_sqlmap', name: 'SQLMap', icon: Database, description: 'Detecção de SQL Injection' },
  { id: 'kali_nikto', name: 'Nikto', icon: Search, description: 'Scanner de vulnerabilidades web' },
  { id: 'kali_hydra', name: 'Hydra', icon: Users, description: 'Força bruta em autenticação' },
  { id: 'kali_aircrack', name: 'Aircrack-ng', icon: Workflow, description: 'Auditoria de redes wireless' },
  { id: 'kali_john', name: 'John the Ripper', icon: Users, description: 'Quebra de senhas' },
  { id: 'kali_custom', name: 'Comando Kali', icon: Workflow, description: 'Executar comando customizado no Kali Linux' }
]

function ScarletIAPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Olá! Sou a Scarlet-IA, sua assistente de investigação OSINT. Tenho acesso completo a todas as ferramentas do sistema. Como posso ajudá-lo hoje?',
      timestamp: new Date(),
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedCase, setSelectedCase] = useState<string>('')
  const [notes, setNotes] = useState<Note[]>([])
  const [currentNote, setCurrentNote] = useState('')
  const [activeTab, setActiveTab] = useState('chat')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Buscar casos disponíveis
  const { data: investigations } = useQuery<Investigation[]>({
    queryKey: ['investigations'],
    queryFn: () => fetchWithAuth('/api/investigations')
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsProcessing(true)

    // Simular resposta da IA (aqui você integraria com sua API real)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Entendi sua solicitação. Vou processar: "${inputMessage}"\n\nPosso usar as seguintes ferramentas para ajudá-lo:\n• Busca OSINT\n• Análise de dados\n• Criação de flows\n\nDeseja que eu prossiga?`,
        timestamp: new Date(),
        tools_used: ['osint_search', 'data_analysis']
      }
      setMessages(prev => [...prev, aiResponse])
      setIsProcessing(false)
    }, 1500)
  }

  const handleSaveNote = () => {
    if (!currentNote.trim()) return

    const newNote: Note = {
      id: Date.now().toString(),
      content: currentNote,
      created_at: new Date(),
      updated_at: new Date(),
      tags: []
    }

    setNotes(prev => [...prev, newNote])
    setCurrentNote('')
  }

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id))
  }

  const handleExportPDF = async () => {
    // Implementar exportação de relatório em PDF
    alert('Exportando relatório em PDF...')
  }

  const handleGenerateReport = async () => {
    // Implementar geração de relatório automático
    alert('Gerando relatório do caso...')
  }

  return (
    <div className="h-full w-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Scarlet-IA</h1>
                <Badge variant="outline" className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
                  <Sparkles className="w-3 h-3 mr-1" />
                  ADMIN
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Assistente OSINT com acesso completo ao sistema</p>
            </div>
          </div>

          {/* Case Selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              <Select value={selectedCase} onValueChange={setSelectedCase}>
                <SelectTrigger className="w-[280px]">
                  <SelectValue placeholder="Selecione um caso" />
                </SelectTrigger>
                <SelectContent>
                  {investigations?.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={handleGenerateReport} disabled={!selectedCase} size="sm">
              <FileText className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
            
            <Button onClick={handleExportPDF} disabled={!selectedCase} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Tools Bar */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
          <span className="text-xs text-muted-foreground mr-2">Ferramentas disponíveis:</span>
          {TOOLS_AVAILABLE.map((tool) => {
            const Icon = tool.icon
            return (
              <Badge key={tool.id} variant="secondary" className="text-xs">
                <Icon className="w-3 h-3 mr-1" />
                {tool.name}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role !== 'user' && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shrink-0">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`flex flex-col gap-2 max-w-[80%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <Card className={message.role === 'user' ? 'bg-primary text-primary-foreground' : ''}>
                      <CardContent className="p-3">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.tools_used && message.tools_used.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border/50">
                            <Sparkles className="w-3 h-3 opacity-70" />
                            <span className="text-xs opacity-70">
                              Ferramentas: {message.tools_used.join(', ')}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <span className="text-xs text-muted-foreground">
                      {format(message.timestamp, 'HH:mm', { locale: ptBR })}
                    </span>
                  </div>

                  {message.role === 'user' && (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex gap-3 justify-start">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <Card>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Processando...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-card p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2">
                <Input
                  placeholder="Digite sua mensagem para a Scarlet-IA..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  className="flex-1"
                  disabled={isProcessing}
                />
                <Button onClick={handleSendMessage} disabled={isProcessing || !inputMessage.trim()}>
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                A IA tem acesso a: Flows, Buscas, OSINT, Face Recognition, Análise de Dados e todas ferramentas do sistema
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar - Notes & Results */}
        <div className="w-[400px] border-l flex flex-col bg-card">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="notes">
                  <FileText className="w-4 h-4 mr-2" />
                  Anotações
                </TabsTrigger>
                <TabsTrigger value="results">
                  <Database className="w-4 h-4 mr-2" />
                  Resultados
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="notes" className="flex-1 flex flex-col p-4 mt-0">
              <div className="space-y-3 mb-4">
                <Textarea
                  placeholder="Adicione uma anotação sobre o caso..."
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button onClick={handleSaveNote} className="w-full" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Anotação
                </Button>
              </div>

              <Separator />

              <ScrollArea className="flex-1 mt-4">
                <div className="space-y-3">
                  {notes.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhuma anotação ainda</p>
                    </div>
                  ) : (
                    notes.map((note) => (
                      <Card key={note.id}>
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs text-muted-foreground">
                              {format(note.created_at, 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="results" className="flex-1 flex flex-col p-4 mt-0">
              <ScrollArea className="flex-1">
                <div className="space-y-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        Integração com Caso
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        {selectedCase ? 'Caso selecionado. Todas as análises serão vinculadas.' : 'Selecione um caso para vincular os resultados'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        Última Análise
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Aguardando primeira solicitação à IA
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-500" />
                        Alertas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Nenhum alerta no momento
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
