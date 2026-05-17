# 🌳 Family Tree App

A full-stack web app for families to create, manage, and explore their family trees.

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Spring Boot 3.x (Java 21) |
| Auth | Spring Security + JWT |
| Database | PostgreSQL |
| ORM | Spring Data JPA + Hibernate |
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Tree Viz | D3.js |

## Architecture

```
frontend (React + D3.js)
       ↕ REST/JSON
backend (Spring Boot + JWT)
       ↕ JPA
    PostgreSQL
```

## Data Model

- **User** — account holder
- **FamilyTree** — belongs to a user, holds all members
- **Person** — a member (name, DOB, DOD, photo, bio)
- **Relationship** — edge between two persons (PARENT, CHILD, SPOUSE, SIBLING)

## Features

- 🔐 Register / Login with JWT auth
- 🌳 Create & manage family trees
- 👤 Add/edit persons with photos
- 🔗 Define relationships between persons
- 🔍 Find relationship path between any two people (BFS)
- 🖼️ Interactive D3.js tree visualization

## Getting Started

### Prerequisites
- Java 21
- Docker & Docker Compose
- Node.js 20+

### Run with Docker

```bash
docker-compose up -d
```

### Backend (dev)

```bash
cd backend
./mvnw spring-boot:run
```
Backend runs at: http://localhost:8080

### Frontend (dev)

```bash
cd frontend
npm install
npm run dev
```
Frontend runs at: http://localhost:5173

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login → JWT |
| GET/POST | /api/trees | List / create trees |
| GET/POST | /api/trees/{id}/persons | List / add persons |
| POST | /api/trees/{id}/relationships | Add relationship |
| GET | /api/trees/{id}/find-path | Find relation between two people |

## Development Phases

- [x] Phase 1 — Project scaffold + Auth + Docker
- [x] Phase 2 — Person & Relationship CRUD APIs
- [ ] Phase 3 — React UI + D3.js tree visualization
- [ ] Phase 4 — Relationship Finder UI
- [ ] Phase 5 — Photo uploads + polish
- [ ] Phase 6 — Production deployment (Railway/Render)

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login → JWT |
| GET/POST | /api/trees | List / create trees |
| PUT/DELETE | /api/trees/{id} | Update / delete tree |
| GET/POST | /api/trees/{id}/persons | List / add persons |
| PUT/DELETE | /api/trees/{id}/persons/{pid} | Update / delete person |
| GET/POST | /api/trees/{id}/relationships | List / add relationships |
| DELETE | /api/trees/{id}/relationships/{rid} | Remove relationship |
| GET | /api/trees/{id}/find-path?from=&to= | BFS relationship finder |

## Context (for Code Puppy 🐾)

- **Current Phase:** 2 complete — All CRUD APIs + BFS graph engine built
- **Stack decisions:** JWT stateless auth, BFS for relationship finder, D3.js for viz
- **Next:** Phase 3 - React UI + D3.js Tree Visualization
