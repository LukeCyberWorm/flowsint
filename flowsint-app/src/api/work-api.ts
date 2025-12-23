import axios from 'axios'

// API local (proxy backend) ao invés de chamar direto a Work API
// Isso resolve problemas de CORS
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/api/work`
  }
  return '/api/work'
}

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true, // Envia cookies de autenticação
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Interceptor para adicionar token de autenticação se necessário
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const workApi = {
  // Busca por CPF
  searchCpf: (cpf: string) => api.get(`/cpf/${cpf.replace(/\D/g, '')}`),

  // Busca por CNPJ
  searchCnpj: (cnpj: string) => api.get(`/cnpj/${cnpj.replace(/\D/g, '')}`),

  // Busca por Placa (corrigido para usar endpoint correto: veiculo)
  searchPlaca: (placa: string) => api.get(`/veiculo/${placa.toUpperCase()}`),

  // Busca por Telefone
  searchTelefone: (phone: string) => api.get(`/telefone/${phone.replace(/\D/g, '')}`),

  // Busca por Email
  searchEmail: (email: string) => api.get(`/email/${email}`)
}
