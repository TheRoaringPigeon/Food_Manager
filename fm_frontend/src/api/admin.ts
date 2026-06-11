import { apiFetch } from './client'
import type { UserRecord, FamilyWithMembers, UserRole, UpdateUserPayload } from '../types/auth'

export const listUsers = (includeInactive = false) =>
  apiFetch<UserRecord[]>(`/users${includeInactive ? '?include_inactive=true' : ''}`)

export const createUser = (username: string, password: string, role: UserRole) =>
  apiFetch<UserRecord>('/users', {
    method: 'POST',
    body: JSON.stringify({ username, password, role }),
  })

export const updateUser = (userId: number, payload: UpdateUserPayload) =>
  apiFetch<UserRecord>(`/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
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

export const deactivateUser = (userId: number) =>
  apiFetch<void>(`/users/${userId}`, { method: 'DELETE' })

export const activateUser = (userId: number) =>
  apiFetch<UserRecord>(`/users/${userId}/activate`, { method: 'PATCH' })

export const listFamilies = () =>
  apiFetch<FamilyWithMembers[]>('/families')

export const createFamily = (name: string) =>
  apiFetch<FamilyWithMembers>('/families', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })

export const renameFamily = (familyId: number, name: string) =>
  apiFetch<FamilyWithMembers>(`/families/${familyId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })

export const deleteFamily = (familyId: number) =>
  apiFetch<void>(`/families/${familyId}`, { method: 'DELETE' })
