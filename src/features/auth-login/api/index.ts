import { http } from '@shared/api/http'
import type { User } from '@entities/user/model/types'

// Login API call - body will be automatically JSON.stringify'd by your http utility
export const postLogin = (credentials: { usernameOrEmail: string; password: string }) =>
  http<{ token?: string; user: User }>('/auth/login', {
    method: 'POST',
    body: credentials,
  })

// Register API call (optional)
export const postRegister = (userData: {
  usernameOrEmail: string
  password: string
  name?: string
}) =>
  http<{ token?: string; user: User }>('/auth/register', {
    method: 'POST',
    body: userData,
  })
