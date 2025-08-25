import { http } from '@shared/api/http'
import type { Role } from '../model/types'
export const getRoles = () => http<Role[]>('/roles', { cacheTtlMs: 5 * 60_000 })
export const createRole = (r: Pick<Role, 'name'>) =>
  http<Role>('/roles', { method: 'POST', body: r })
export const getRole = (id: Role['id']) => http<Role>(`/roles/${id}`, { cacheTtlMs: 5 * 60_000 })
