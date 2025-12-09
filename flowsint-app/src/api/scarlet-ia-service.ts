import { fetchWithAuth } from './api'

export interface AIMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  tools_used?: string[]
  attachments?: Array<{ type: string; data: any }>
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

export const scarletIAService = {
  // Send message to AI
  sendMessage: async (request: AIRequest): Promise<AIResponse> => {
    return fetchWithAuth('/api/scarlet-ia/chat', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  },

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
