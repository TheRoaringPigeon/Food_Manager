export type UserRole = 'admin' | 'standard'

export interface AuthUser {
  id: number
  username: string
  role: UserRole
  family_id: number | null
  theme?: string
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

export interface FamilyMember {
  id: number
  username: string
  role: UserRole
  is_active: boolean
}

export interface FamilyWithMembers extends Family {
  users: FamilyMember[]
}

export interface UserRecord {
  id: number
  username: string
  role: UserRole
  family_id: number | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UpdateUserPayload {
  username?: string
  password?: string
  theme?: string
}
