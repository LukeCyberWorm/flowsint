import axios from 'axios'

const API_URL = (import.meta as any).env.VITE_API_URL || '/api'

export const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
})

export const login = async (username: string, password: string) => {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)

  const response = await authApi.post('/auth/token', formData)
  return response.data
}
