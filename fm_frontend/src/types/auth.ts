export type UserRole = 'admin' | 'standard'

export interface AuthUser {
  id: number
  username: string
  role: UserRole
  family_id: number | null
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: AuthUser
}

export interface Family {
  id: number
  name: string
  created_at: string
}

export interface UserRecord {
  id: number
  username: string
  role: UserRole
  family_id: number | null
  created_at: string
  updated_at: string
}
