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
- [x] Phase 3 — React UI + D3.js tree visualization
- [x] Phase 4 — Photo uploads + Railway deployment
- [ ] Phase 5 — Polish + testing

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

- **Current Phase:** 4 complete — Photos + Railway deploy config done
- **Stack decisions:** Local FS photo storage, JWT auth, BFS relationship finder, D3.js generational tree
- **Next:** Phase 5 — Polish + testing

## 🚀 Deploy to Railway (your family can use this!)

### Step 1 — Create Railway account
Go to [railway.app](https://railway.app) → sign up with GitHub

### Step 2 — Deploy Backend
1. New Project → Deploy from GitHub repo → select `family-tree-app`
2. Set **Root Directory** = `backend`
3. Railway auto-detects the Dockerfile ✔️
4. Add a **PostgreSQL** plugin (one click in Railway dashboard)
5. Railway auto-injects `DATABASE_URL` — but we use Spring format, so set these env vars manually:
```
SPRING_DATASOURCE_URL    = jdbc:postgresql://HOST:PORT/railway
SPRING_DATASOURCE_USERNAME = postgres
SPRING_DATASOURCE_PASSWORD = (from Railway PostgreSQL plugin)
JWT_SECRET               = (generate a random 32+ char string)
JWT_EXPIRATION_MS        = 86400000
```
6. Deploy → note your backend URL (e.g. `https://family-tree-backend.up.railway.app`)

### Step 3 — Deploy Frontend
1. Add new service in same project → Deploy from GitHub repo
2. Set **Root Directory** = `frontend`
3. Set build arg / env var:
```
VITE_API_URL = https://family-tree-backend.up.railway.app
```
4. Deploy → share the frontend URL with your family! 🌳

### Step 4 — Share with family
Share the frontend Railway URL. Everyone creates their own account and collaborates on the same tree!
