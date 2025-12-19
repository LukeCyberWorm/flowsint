import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dossier-admin-auth')
  if (token) {
    try {
      const parsed = JSON.parse(token)
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`
      }
    } catch (e) {
      // Ignore
    }
  }
  return config
})

// Types
export interface Dossier {
  id: string
  investigation_id: string
  case_number: string
  title: string
  description?: string
  status: 'draft' | 'active' | 'archived' | 'closed'
  client_name?: string
  client_email?: string
  assigned_to?: string
  is_public: boolean
  access_token?: string
  tags?: string[]
  metadata?: any
  created_at: string
  updated_at: string
  created_by: string
  file_count?: number
  note_count?: number
  total_size?: number
}

export interface DossierFile {
  id: string
  dossier_id: string
  filename: string
  original_filename: string
  file_type: 'document' | 'image' | 'video' | 'audio' | 'other'
  mime_type?: string
  file_size?: number
  file_path: string
  file_url?: string
  description?: string
  tags?: string[]
  is_visible_to_client: boolean
  order: number
  created_at: string
  created_by: string
}

export interface DossierNote {
  id: string
  dossier_id: string
  title?: string
  content: string
  note_type: string
  is_internal: boolean
  is_pinned: boolean
  order: number
  tags?: string[]
  metadata?: any
  created_at: string
  updated_at: string
  created_by: string
  updated_by?: string
}

export interface CreateDossierRequest {
  investigation_id: string
  case_number: string
  title: string
  description?: string
  client_name?: string
  client_email?: string
  is_public: boolean
  access_password?: string
  tags?: string[]
}

export interface UpdateDossierRequest {
  title?: string
  description?: string
  status?: 'draft' | 'active' | 'archived' | 'closed'
  client_name?: string
  client_email?: string
  assigned_to?: string
  is_public?: boolean
  access_password?: string
  tags?: string[]
}

// API Functions
export const dossierApi = {
  // Auth
  login: async (email: string, password: string) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    const { data } = await api.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return data
  },

  // Dossiers
  listDossiers: async (params?: {
    q?: string
    status?: string
    skip?: number
    limit?: number
  }): Promise<{ items: Dossier[]; total: number }> => {
    const { data } = await api.get('/dossiers/', { params })
    return data
  },

  getDossier: async (dossierId: string): Promise<Dossier> => {
    const { data } = await api.get(`/dossiers/${dossierId}`)
    return data
  },

  createDossier: async (dossier: CreateDossierRequest): Promise<Dossier> => {
    const { data } = await api.post('/dossiers/', dossier)
    return data
  },

  updateDossier: async (dossierId: string, updates: UpdateDossierRequest): Promise<Dossier> => {
    const { data } = await api.put(`/dossiers/${dossierId}`, updates)
    return data
  },

  deleteDossier: async (dossierId: string): Promise<void> => {
    await api.delete(`/dossiers/${dossierId}`)
  },

  // Files
  listFiles: async (dossierId: string): Promise<DossierFile[]> => {
    const { data } = await api.get(`/dossiers/${dossierId}/files`)
    return data
  },

  uploadFile: async (
    dossierId: string,
    file: File,
    metadata?: {
      description?: string
      tags?: string[]
      is_visible_to_client?: boolean
    }
  ): Promise<DossierFile> => {
    const formData = new FormData()
    formData.append('file', file)
    if (metadata?.description) formData.append('description', metadata.description)
    if (metadata?.tags) formData.append('tags', JSON.stringify(metadata.tags))
    if (metadata?.is_visible_to_client !== undefined)
      formData.append('is_visible_to_client', String(metadata.is_visible_to_client))

    const { data } = await api.post(`/dossiers/${dossierId}/files`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return data
  },

  deleteFile: async (dossierId: string, fileId: string): Promise<void> => {
    await api.delete(`/dossiers/${dossierId}/files/${fileId}`)
  },

  // Notes
  listNotes: async (dossierId: string, includeInternal = true): Promise<DossierNote[]> => {
    const { data } = await api.get(`/dossiers/${dossierId}/notes`, {
      params: { include_internal: includeInternal },
    })
    return data
  },

  createNote: async (
    dossierId: string,
    note: {
      title?: string
      content: string
      note_type?: string
      is_internal?: boolean
      is_pinned?: boolean
      tags?: string[]
    }
  ): Promise<DossierNote> => {
    const { data } = await api.post(`/dossiers/${dossierId}/notes`, note)
    return data
  },

  updateNote: async (
    dossierId: string,
    noteId: string,
    updates: Partial<DossierNote>
  ): Promise<DossierNote> => {
    const { data } = await api.put(`/dossiers/${dossierId}/notes/${noteId}`, updates)
    return data
  },

  deleteNote: async (dossierId: string, noteId: string): Promise<void> => {
    await api.delete(`/dossiers/${dossierId}/notes/${noteId}`)
  },

  // Investigations (from main API)
  listInvestigations: async (): Promise<any[]> => {
    const { data } = await api.get('/investigations')
    return data
  },
}
