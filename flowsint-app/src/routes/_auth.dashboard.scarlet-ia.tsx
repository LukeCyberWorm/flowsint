import { createFileRoute } from '@tanstack/react-router'
import { 
  Brain, Send, FileText, Download, Save, Trash2, 
  Sparkles, Loader2, FolderOpen, MessageSquare, 
  ChevronRight, Search, Users, Globe, FileSearch,
  Workflow, Database, AlertCircle, CheckCircle2,
  Clock, Eye, PlusCircle, X, History, Plus
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
import { scarletIAService, ChatMessage as APIChatMessage, MessagePart } from '@/api/scarlet-ia-service'
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

interface ChatSession {
  id: string
  title: string
  created_at: Date
  last_message_at: Date
  message_count: number
  investigation_id?: string
}

interface SavedDocument {
  id: string
  title: string
  content: string
  type: 'note' | 'evidence' | 'report'
  created_at: Date
  chat_id: string
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
  const [chatId, setChatId] = useState(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  })
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
  const [showHistory, setShowHistory] = useState(false)
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [savedDocuments, setSavedDocuments] = useState<SavedDocument[]>([])
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

  // Carregar chat sessions do localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('scarlet-ia-sessions')
    if (savedSessions) {
      const sessions = JSON.parse(savedSessions)
      setChatSessions(sessions.map((s: any) => ({
        ...s,
        created_at: new Date(s.created_at),
        last_message_at: new Date(s.last_message_at)
      })))
    }
  }, [])

  // Salvar chat atual quando houver mudanças
  useEffect(() => {
    if (messages.length > 1) {
      const currentSession: ChatSession = {
        id: chatId,
        title: messages.find(m => m.role === 'user')?.content.slice(0, 50) || 'Novo Chat',
        created_at: new Date(),
        last_message_at: new Date(),
        message_count: messages.length,
        investigation_id: selectedCase
      }

      setChatSessions(prev => {
        const updated = prev.filter(s => s.id !== chatId)
        const newSessions = [currentSession, ...updated].slice(0, 50)
        localStorage.setItem('scarlet-ia-sessions', JSON.stringify(newSessions))
        return newSessions
      })
    }
  }, [messages, chatId, selectedCase])

  const handleNewChat = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const newChatId = Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    
    setChatId(newChatId)
    setMessages([{
      id: '1',
      role: 'system',
      content: 'Olá! Sou a Scarlet-IA, sua assistente de investigação OSINT. Tenho acesso completo a todas as ferramentas do sistema. Como posso ajudá-lo hoje?',
      timestamp: new Date(),
    }])
    setShowHistory(false)
  }

  const handleLoadSession = (sessionId: string) => {
    const savedMessages = localStorage.getItem(`scarlet-ia-chat-${sessionId}`)
    if (savedMessages) {
      const msgs = JSON.parse(savedMessages)
      setChatId(sessionId)
      setMessages(msgs.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })))
      setShowHistory(false)
    }
  }

  const handleSaveDocument = (content: string, title: string, type: 'note' | 'evidence' | 'report') => {
    const doc: SavedDocument = {
      id: Date.now().toString(),
      title,
      content,
      type,
      created_at: new Date(),
      chat_id: chatId
    }
    
    setSavedDocuments(prev => {
      const updated = [...prev, doc]
      localStorage.setItem(`scarlet-ia-docs-${chatId}`, JSON.stringify(updated))
      return updated
    })
  }

  const handleSendMessage = async () => {
    console.log('[ScarletIA Component] handleSendMessage called', { inputMessage, isProcessing })
    if (!inputMessage.trim() || isProcessing) {
      console.log('[ScarletIA Component] Blocked: empty message or processing')
      return
    }

    const userMessageId = Date.now().toString()
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsProcessing(true)

    // Salvar mensagens no localStorage
    localStorage.setItem(`scarlet-ia-chat-${chatId}`, JSON.stringify([...messages, userMessage]))

    // Criar mensagem da IA que será populada com streaming
    const aiMessageId = (Date.now() + 1).toString()
    const aiMessage: Message = {
      id: aiMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      tools_used: []
    }
    setMessages(prev => [...prev, aiMessage])

    // Converter mensagens para formato da API
    const apiMessages: APIChatMessage[] = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        id: m.id,
        role: m.role,
        parts: [{ type: 'text' as const, text: m.content }],
        sources: []
      }))
    
    // Adicionar mensagem do usuário
    apiMessages.push({
      id: userMessageId,
      role: 'user',
      parts: [{ type: 'text' as const, text: inputMessage }],
      sources: []
    })

    try {
      console.log('[ScarletIA Component] Calling sendMessageStream with:', { chatId, messagesCount: apiMessages.length, selectedCase })
      await scarletIAService.sendMessageStream(
        chatId,
        apiMessages,
        (chunk: MessagePart) => {
          // Atualizar mensagem com chunks de texto
          if (chunk.type === 'text' && chunk.text) {
            setMessages(prev => 
              prev.map(m => 
                m.id === aiMessageId 
                  ? { ...m, content: m.content + chunk.text }
                  : m
              )
            )
          }
        },
        () => {
          // Streaming completo
          setIsProcessing(false)
        },
        (error: string) => {
          console.error('Erro no streaming:', error)
          setMessages(prev => 
            prev.map(m => 
              m.id === aiMessageId 
                ? { ...m, content: `Erro ao processar mensagem: ${error}` }
                : m
            )
          )
          setIsProcessing(false)
        },
        selectedCase || undefined
      )
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error)
      setMessages(prev => 
        prev.map(m => 
          m.id === aiMessageId 
            ? { ...m, content: 'Erro ao conectar com a IA. Por favor, tente novamente.' }
            : m
        )
      )
      setIsProcessing(false)
    }
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
    <div className="h-full w-full flex flex-col bg-background relative">
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHistory(!showHistory)}
                  className="ml-2"
                  title="Histórico de Chats"
                >
                  <History className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Assistente OSINT com acesso completo ao sistema</p>
            </div>
          </div>

          {/* Case Selector */}
          <div className="flex items-center gap-3">
            <Button onClick={handleNewChat} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Chat
            </Button>
            
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
          <span className="text-xs text-muted-foreground mr-2">Ferramentas RSL + Kali Linux disponíveis:</span>
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

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed right-0 top-0 h-full w-96 bg-card border-l shadow-lg z-50 flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Histórico de Chats</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setShowHistory(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              {chatSessions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum chat salvo ainda</p>
                </div>
              ) : (
                chatSessions.map((session) => (
                  <Card 
                    key={session.id} 
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => handleLoadSession(session.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium truncate">{session.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {format(session.last_message_at, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <MessageSquare className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {session.message_count} mensagens
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {session.id === chatId ? 'Atual' : 'Salvo'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
          
          <div className="p-4 border-t">
            <Button onClick={handleNewChat} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Iniciar Novo Chat
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Section */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto px-6 py-4">
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
          </div>

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

              <div className="flex-1 overflow-y-auto mt-4">
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
              </div>
            </TabsContent>

            <TabsContent value="results" className="flex-1 flex flex-col p-4 mt-0">
              <div className="flex-1 overflow-y-auto">
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
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
