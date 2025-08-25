import { http } from '@shared/api/http'
import type { User, Id, Page, UserRole } from '../model/types'

export const getUsers = (q?: { page?: number; size?: number }) =>
  http<Page<User>>(`/users${qs(q)}`, { cacheTtlMs: 60_000 })

export const getUser = (id: Id) => http<User>(`/users/${id}`, { cacheTtlMs: 60_000 })

export const createUser = (
  user: Pick<
    User,
    | 'userName'
    | 'firstName'
    | 'middleName'
    | 'lastName'
    | 'motherMaidenName'
    | 'dateOfBirth'
    | 'email'
    | 'hashedPassword'
    | 'roleId'
  >,
) => http<User>('/users', { method: 'POST', body: user })

export const updateUser = (id: Id, user: Partial<Omit<User, 'id' | 'role'>>) =>
  http<User>(`/users/${id}`, { method: 'PUT', body: user })

export const deleteUser = (id: Id) => http<void>(`/users/${id}`, { method: 'DELETE' })

function qs(p?: Record<string, unknown>) {
  if (!p) return ''
  const s = new URLSearchParams()
  for (const [k, v] of Object.entries(p)) {
    if (v != null) s.set(k, String(v))
  }
  const q = s.toString()
  return q ? `?${q}` : ''
}
