import axios from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL || '/api'

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
  file_name: string
  file_type?: string
  file_size?: number
  file_url: string
  uploaded_at?: string
  uploaded_by?: string
}

export interface DossierNote {
  id: string
  dossier_id: string
  content: string
  is_pinned?: boolean
  created_at?: string
  created_by?: string
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

  // --- Admin Functions ---
  
  getAllDossiers: async (token: string): Promise<Dossier[]> => {
    const { data } = await api.get('/dossiers', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  createDossier: async (token: string, dossierData: Partial<Dossier>): Promise<Dossier> => {
    const { data } = await api.post('/dossiers', dossierData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  updateDossier: async (token: string, id: string, dossierData: Partial<Dossier>): Promise<Dossier> => {
    const { data } = await api.put(`/dossiers/${id}`, dossierData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  createNote: async (token: string, dossierId: string, content: string, isPinned: boolean = false): Promise<DossierNote> => {
    const { data } = await api.post(`/dossiers/${dossierId}/notes`, { content, is_pinned: isPinned }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  },

  uploadFile: async (token: string, dossierId: string, file: File): Promise<DossierFile> => {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await api.post(`/dossiers/${dossierId}/files`, formData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    return data
  }
}
