import { apiFetch } from './client'
import type { UserRecord, Family, UserRole } from '../types/auth'

export const listUsers = () =>
  apiFetch<UserRecord[]>('/users')

export const createUser = (username: string, password: string, role: UserRole) =>
  apiFetch<UserRecord>('/users', {
    method: 'POST',
    body: JSON.stringify({ username, password, role }),
  })

export const assignFamily = (userId: number, familyId: number | null) =>
  apiFetch<UserRecord>(`/users/${userId}/family`, {
    method: 'PATCH',
    body: JSON.stringify({ family_id: familyId }),
  })

export const changeRole = (userId: number, role: UserRole) =>
  apiFetch<UserRecord>(`/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })

export const listFamilies = () =>
  apiFetch<Family[]>('/families')

export const createFamily = (name: string) =>
  apiFetch<Family>('/families', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })

export const deleteUser = (userId: number) =>
  apiFetch<void>(`/users/${userId}`, { method: 'DELETE' })
