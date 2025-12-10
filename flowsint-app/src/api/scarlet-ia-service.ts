import { fetchWithAuth } from './api'

export interface MessagePart {
  type: 'text' | 'step-start' | 'sources' | 'error'
  text?: string
  state?: 'streaming' | 'done'
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  parts: MessagePart[]
  sources?: Array<{ title: string; url: string }>
}

export interface ChatRequest {
  id: string  // chat_id
  messages: ChatMessage[]
  trigger: 'submit-message'
  investigation_id?: string
}

export interface AIRequest {
  message: string
  investigation_id?: string
  context?: Record<string, any>
  tools_allowed?: string[]
}

export interface AIResponse {
  message: string
  tools_used: string[]
  results?: Record<string, any>
  suggestions?: string[]
}

export interface ReportRequest {
  investigation_id: string
  include_chat_history?: boolean
  include_notes?: boolean
  include_analysis?: boolean
}

// Generate random ID similar to SkynetChat format
const generateId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const scarletIAService = {
  // Send message to AI with streaming support
  sendMessageStream: async (
    chatId: string,
    messages: ChatMessage[],
    onChunk: (chunk: MessagePart) => void,
    onComplete: () => void,
    onError: (error: string) => void,
    investigationId?: string
  ): Promise<void> => {
    const token = localStorage.getItem('token')
    
    const request: ChatRequest = {
      id: chatId,
      messages,
      trigger: 'submit-message',
      investigation_id: investigationId
    }

    try {
      const response = await fetch('/api/scarlet-ia/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Response body is not readable')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          onComplete()
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              onComplete()
              return
            }

            try {
              const chunk = JSON.parse(data) as MessagePart
              onChunk(chunk)
            } catch (e) {
              console.error('Failed to parse SSE chunk:', e, data)
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream error:', error)
      onError(error instanceof Error ? error.message : 'Unknown error')
    }
  },

  // Legacy method for backwards compatibility
  sendMessage: async (request: AIRequest): Promise<AIResponse> => {
    return fetchWithAuth('/api/scarlet-ia/chat', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  },

  // Generate new chat/message IDs
  generateChatId: (): string => generateId(),
  generateMessageId: (): string => generateId(),

  // Execute Kali Linux command via SSH
  executeKaliCommand: async (command: string, investigationId?: string): Promise<any> => {
    return fetchWithAuth('/api/scarlet-ia/execute-kali', {
      method: 'POST',
      body: JSON.stringify({ 
        command, 
        investigation_id: investigationId 
      })
    })
  },

  // Get chat history
  getChatHistory: async (investigationId?: string): Promise<AIMessage[]> => {
    const url = investigationId 
      ? `/api/scarlet-ia/history?investigation_id=${investigationId}`
      : '/api/scarlet-ia/history'
    return fetchWithAuth(url, {
      method: 'GET'
    })
  },

  // Save note
  saveNote: async (investigationId: string, content: string, tags: string[] = []): Promise<any> => {
    return fetchWithAuth(`/api/scarlet-ia/notes`, {
      method: 'POST',
      body: JSON.stringify({
        investigation_id: investigationId,
        content,
        tags
      })
    })
  },

  // Get notes
  getNotes: async (investigationId: string): Promise<any[]> => {
    return fetchWithAuth(`/api/scarlet-ia/notes?investigation_id=${investigationId}`, {
      method: 'GET'
    })
  },

  // Delete note
  deleteNote: async (noteId: string): Promise<void> => {
    return fetchWithAuth(`/api/scarlet-ia/notes/${noteId}`, {
      method: 'DELETE'
    })
  },

  // Generate report
  generateReport: async (request: ReportRequest): Promise<any> => {
    return fetchWithAuth('/api/scarlet-ia/generate-report', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  },

  // Export report as PDF
  exportPDF: async (investigationId: string): Promise<Blob> => {
    const response = await fetch(`${window.location.origin}/api/scarlet-ia/export-pdf/${investigationId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    
    if (!response.ok) {
      throw new Error('Failed to export PDF')
    }
    
    return response.blob()
  },

  // Execute tool
  executeTool: async (toolId: string, params: Record<string, any>): Promise<any> => {
    return fetchWithAuth('/api/scarlet-ia/execute-tool', {
      method: 'POST',
      body: JSON.stringify({
        tool_id: toolId,
        params
      })
    })
  },

  // Get available tools
  getAvailableTools: async (): Promise<any[]> => {
    return fetchWithAuth('/api/scarlet-ia/tools', {
      method: 'GET'
    })
  },

  // Get Kali Linux tools
  getKaliTools: async (): Promise<any[]> => {
    return fetchWithAuth('/api/scarlet-ia/kali-tools', {
      method: 'GET'
    })
  }
}
