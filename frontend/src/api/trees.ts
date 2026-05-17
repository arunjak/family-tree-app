import api from './client'
import type { FamilyTree } from '@/types'

export const getTrees = () =>
  api.get<FamilyTree[]>('/trees')

export const createTree = (name: string, description?: string) =>
  api.post<FamilyTree>('/trees', { name, description })

export const getTree = (id: number) =>
  api.get<FamilyTree>(`/trees/${id}`)

export const deleteTree = (id: number) =>
  api.delete(`/trees/${id}`)
