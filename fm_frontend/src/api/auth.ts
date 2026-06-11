import type { TokenResponse } from '../types/auth'

const FM_API = '/food-manager/api'

export async function login(username: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${FM_API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Login failed')
  }
  return res.json()
}

export async function signup(username: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${FM_API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Signup failed')
  }
  return res.json()
}
