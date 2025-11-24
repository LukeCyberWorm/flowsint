import { useAuthStore } from '@/stores/auth-store'

// Use window.location.origin to ensure we use the same protocol (HTTPS) as the page
const API_URL = typeof window !== 'undefined' ? window.location.origin : ''

console.log('[API] Using API_URL:', API_URL)

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<any> {
  console.log('[API] Fetching:', `${API_URL}${endpoint}`)
  const token = useAuthStore.getState().token

  // Check if body is FormData - if so, don't set Content-Type (browser will set it with boundary)
  const isFormData = options.body instanceof FormData
  const defaultHeaders: HeadersInit = {}
  if (!isFormData) {
    defaultHeaders['Content-Type'] = 'application/json'
  }
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`
  }
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config)
    console.log('[API] Response status:', response.status, 'for', endpoint)
    if (response.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
      throw new Error('Session expired, login again.')
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[API] Error response:', errorData)
      throw new Error(errorData.detail || `Erreur ${response.status}`)
    }
    if (response.status === 204) {
      return null
    }
    const data = await response.json()
    console.log('[API] Response data for', endpoint, ':', data)
    return data
  } catch (error) {
    console.error('[API] Fetch error for', endpoint, ':', error)
    throw error
  }
}
