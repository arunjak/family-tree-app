import api from './client'
import type { AuthResponse } from '@/types'

export const register = (name: string, email: string, password: string) =>
  api.post<AuthResponse>('/auth/register', { name, email, password })

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password })
