// Core domain types for the Family Tree App

export interface User {
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
}

export interface FamilyTree {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Person {
  id: number;
  treeId: number;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  gender?: Gender;
  bio?: string;
  photoUrl?: string;
}

export type RelationType = 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING';

export interface Relationship {
  id: number;
  personId: number;
  relatedPersonId: number;
  relationType: RelationType;
}

export interface RelationshipPath {
  path: Person[];
  description: string;
}
