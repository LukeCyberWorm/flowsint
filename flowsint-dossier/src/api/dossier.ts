import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Types
export interface Dossier {
  id: string
  case_number: string
  title: string
  description?: string
  status: 'draft' | 'active' | 'archived' | 'closed'
  client_name?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface DossierFile {
  id: string
  dossier_id: string
  filename: string
  original_filename: string
  file_type: 'document' | 'image' | 'video' | 'audio' | 'other'
  mime_type?: string
  file_size?: number
  file_url?: string
  description?: string
  tags?: string[]
  created_at: string
}

export interface DossierNote {
  id: string
  dossier_id: string
  title?: string
  content: string
  note_type: string
  is_pinned: boolean
  order: number
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  dossier_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  sources?: Array<{ title: string; url: string }>
  created_at: string
}

// API Functions
export const dossierApi = {
  // Client access
  accessDossier: async (accessToken: string, password?: string): Promise<Dossier> => {
    const { data } = await api.post('/dossiers/client/access', {
      access_token: accessToken,
      password,
    })
    return data
  },

  // Get files
  getFiles: async (accessToken: string): Promise<DossierFile[]> => {
    const { data } = await api.get(`/dossiers/client/${accessToken}/files`)
    return data
  },

  // Get notes
  getNotes: async (accessToken: string): Promise<DossierNote[]> => {
    const { data } = await api.get(`/dossiers/client/${accessToken}/notes`)
    return data
  },

  // Download file
  downloadFile: (dossierId: string, fileId: string, token?: string) => {
    const params = token ? `?token=${token}` : ''
    return `${API_URL}/dossiers/${dossierId}/files/${fileId}/download${params}`
  },

  // Chat with IA (requires auth)
  sendChatMessage: async (dossierId: string, content: string, token: string): Promise<ChatMessage> => {
    const { data } = await api.post(
      `/dossiers/${dossierId}/chat`,
      { content },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return data
  },

  // Get chat history (requires auth)
  getChatHistory: async (dossierId: string, token: string): Promise<ChatMessage[]> => {
    const { data } = await api.get(`/dossiers/${dossierId}/chat`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return data
  },
}
