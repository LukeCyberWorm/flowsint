import { fetchWithAuth } from './api'

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

export interface DossierCreate {
  case_number: string
  title: string
  description?: string
  client_name?: string
  tags?: string[]
  investigation_id?: string
}

export const dossierService = {
  getAllDossiers: async (): Promise<Dossier[]> => {
    const response = await fetchWithAuth('/api/dossiers/')
    return response.items
  },

  createDossier: async (data: DossierCreate): Promise<Dossier> => {
    return await fetchWithAuth('/api/dossiers/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  uploadFile: async (dossierId: string, file: File): Promise<any> => {
    const formData = new FormData()
    formData.append('file', file)
    return await fetchWithAuth(`/api/dossiers/${dossierId}/files`, {
      method: 'POST',
      body: formData,
    })
  },

  createNote: async (dossierId: string, content: string): Promise<any> => {
    return await fetchWithAuth(`/api/dossiers/${dossierId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }
}
