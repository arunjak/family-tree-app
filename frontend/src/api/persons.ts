import api from './client'
import type { Person, Relationship, RelationshipPath } from '@/types'

// Persons
export const getPersons = (treeId: number) =>
  api.get<Person[]>(`/trees/${treeId}/persons`)

export const createPerson = (treeId: number, data: Partial<Person>) =>
  api.post<Person>(`/trees/${treeId}/persons`, data)

export const updatePerson = (treeId: number, personId: number, data: Partial<Person>) =>
  api.put<Person>(`/trees/${treeId}/persons/${personId}`, data)

export const deletePerson = (treeId: number, personId: number) =>
  api.delete(`/trees/${treeId}/persons/${personId}`)

export const uploadPhoto = (treeId: number, personId: number, file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post<Person>(`/trees/${treeId}/persons/${personId}/photo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// Relationships
export const getRelationships = (treeId: number) =>
  api.get<Relationship[]>(`/trees/${treeId}/relationships`)

export const createRelationship = (treeId: number, data: Omit<Relationship, 'id'>) =>
  api.post<Relationship>(`/trees/${treeId}/relationships`, data)

export const deleteRelationship = (treeId: number, relationshipId: number) =>
  api.delete(`/trees/${treeId}/relationships/${relationshipId}`)

// Relationship Finder (BFS)
export const findPath = (treeId: number, fromId: number, toId: number) =>
  api.get<RelationshipPath>(`/trees/${treeId}/find-path`, {
    params: { from: fromId, to: toId },
  })
