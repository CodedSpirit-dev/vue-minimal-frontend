export type Id = string // Guid en C# se representa como string en TypeScript

export interface UserRole {
  id: Id
  name: string
  description: string | null
}

export interface User {
  id: Id
  userName: string | null
  firstName: string
  middleName: string | null
  lastName: string
  motherMaidenName: string | null
  dateOfBirth: string
  email: string
  hashedPassword: string
  roleId: Id
  role?: UserRole
}
export interface Page<T> {
  items: T[]
  total: number
}
