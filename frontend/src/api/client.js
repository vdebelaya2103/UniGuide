
const API_URL = 'http://127.0.0.1:8000'

export async function apiRequest(endpoint, options = {}) {
  const token = sessionStorage.getItem('access_token')

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      typeof data.detail === 'string'
        ? data.detail
        : 'Ошибка при обращении к серверу'
    )
  }

  return data
}
