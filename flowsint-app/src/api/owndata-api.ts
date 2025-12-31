import axios from 'axios'

// Use the backend proxy instead of calling OwnData API directly (to avoid CORS)
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api/owndata`
  }
  return `${window.location.origin}/api/owndata`
}

const api = axios.create({
  baseURL: getApiUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
})

// Sanitize input - remove formatting characters
const sanitize = (value: string): string => {
  return value.replace(/[^\d]/g, '')
}

interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

export const ownDataApi = {
  // CPF Search
  searchCpf: async (cpf: string): Promise<ApiResponse> => {
    try {
      const cleaned = sanitize(cpf)
      const response = await api.post('/cpf', { cpf: cleaned })
      return response.data
    } catch (error: any) {
      console.error('Erro na busca de CPF:', error)
      return { success: false, error: error.response?.data?.error || 'Erro ao buscar CPF' }
    }
  },

  // CNPJ Search
  searchCnpj: async (cnpj: string): Promise<ApiResponse> => {
    try {
      const cleaned = sanitize(cnpj)
      const response = await api.post('/cnpj', { cnpj: cleaned })
      return response.data
    } catch (error: any) {
      console.error('Erro na busca de CNPJ:', error)
      return { success: false, error: error.response?.data?.error || 'Erro ao buscar CNPJ' }
    }
  },

  // Phone Search
  searchTelefone: async (phone: string): Promise<ApiResponse> => {
    try {
      const cleaned = sanitize(phone)
      const response = await api.post('/phone', { phone: cleaned })
      return response.data
    } catch (error: any) {
      console.error('Erro na busca de Telefone:', error)
      return { success: false, error: error.response?.data?.error || 'Erro ao buscar telefone' }
    }
  },

  // Email Search
  searchEmail: async (email: string): Promise<ApiResponse> => {
    try {
      const response = await api.post('/email', { email: email.trim() })
      return response.data
    } catch (error: any) {
      console.error('Erro na busca de Email:', error)
      return { success: false, error: error.response?.data?.error || 'Erro ao buscar email' }
    }
  },

  // Name Search
  searchNome: async (name: string): Promise<ApiResponse> => {
    try {
      const response = await api.post('/name', { name: name.trim() })
      return response.data
    } catch (error: any) {
      console.error('Erro na busca de Nome:', error)
      return { success: false, error: error.response?.data?.error || 'Erro ao buscar nome' }
    }
  },

  // CEP Search
  searchCep: async (cep: string): Promise<ApiResponse> => {
    try {
      const cleaned = sanitize(cep)
      const response = await api.post('/cep', { cep: cleaned })
      return response.data
    } catch (error: any) {
      console.error('Erro na busca de CEP:', error)
      return { success: false, error: error.response?.data?.error || 'Erro ao buscar CEP' }
    }
  },

  // Título Eleitor Search
  searchTitulo: async (titulo: string): Promise<ApiResponse> => {
    try {
      const cleaned = sanitize(titulo)
      const response = await api.post('/title', { title: cleaned })
      return response.data
    } catch (error: any) {
      console.error('Erro na busca de Título:', error)
      return { success: false, error: error.response?.data?.error || 'Erro ao buscar título' }
    }
  },

  // Mother Name Search
  searchMae: async (motherName: string): Promise<ApiResponse> => {
    try {
      const response = await api.post('/mother', { mother: motherName.trim() })
      return response.data
    } catch (error: any) {
      console.error('Erro na busca de Nome da Mãe:', error)
      return { success: false, error: error.response?.data?.error || 'Erro ao buscar nome da mãe' }
    }
  },

  // Generic search with module selection
  search: async (query: string, module: string): Promise<ApiResponse> => {
    const moduleMap: Record<string, string> = {
      cpf: 'cpf',
      cnpj: 'cnpj',
      phone: 'phone',
      telefone: 'phone',
      email: 'email',
      nome: 'name',
      name: 'name',
      cep: 'cep',
      titulo: 'title',
      title: 'title',
      mae: 'mother',
      mother: 'mother'
    }

    const endpoint = moduleMap[module.toLowerCase()]
    if (!endpoint) {
      return { success: false, error: 'Módulo de busca inválido' }
    }

    try {
      const payload: Record<string, string> = {}
      
      // Sanitize numeric inputs
      if (['cpf', 'cnpj', 'phone', 'cep', 'title'].includes(endpoint)) {
        payload[endpoint] = sanitize(query)
      } else {
        payload[endpoint] = query.trim()
      }

      const response = await api.post(`/${endpoint}`, payload)
      return { success: true, data: response.data }
    } catch (error: any) {
      console.error(`Erro na busca de ${module}:`, error)
      return { success: false, error: error.response?.data?.message || `Erro ao buscar ${module}` }
    }
  }
}
