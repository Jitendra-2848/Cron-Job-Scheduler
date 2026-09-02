# ⏱️ CronMaster

> **Distributed Webhook Scheduler & Enterprise Cron Job Orchestration System**

CronMaster is a high-pe![alt text]perrformance, fault-tolerant cron job and webhook scheduling platform designed for modern microservices architectures. Built with sub-millisecond queue concurrency, PostgreSQL persistence, Redis task distribution, and an intuitive React management dashboard.

---

## 🌟 Key Features

- **⚡ Sub-Millisecond Scheduling**: Standard 5-part cron expression support with automated execution triggers.
- **🔄 Automated Webhook Retries**: Configurable exponential backoff retries (GET, POST, PUT, DELETE) with custom JSON payloads.
- **📊 Interactive Gantt Execution Timeline**: Real-time duration telemetry, latency alignment, and status monitoring per job.
- **🔐 Secure Authentication**: JWT session management with HTTP-Only cookie security and protected routes.
- **🛡️ Task Queue Resilience**: Redis & BullMQ task queues guaranteeing high availability and workload isolation.
- **🎨 Modern UI / UX**: Light, Dark, and System theme support powered by Tailwind CSS v4 and responsive layouts.
- **🚀 CI/CD Ready**: Automated GitHub Actions workflows for continuous integration, linting, production builds, and Docker validation.

---

## ⚙️ Tech Stack Architecture

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **State & Router**: React Router v7 + Context API (`AuthContext`, `CronContext`, `ThemeContext`)
- **UI Components**: Interactive Gantt Timeline, Skeleton Loaders, Server Response Toast Alerts (`react-hot-toast`)

### Backend Services
- **API Service** (`services/api`): Node.js + Express + TypeScript + JWT + Cookie Parser
- **Scheduler Service** (`services/scheduler`): Node-Cron + BullMQ Queue Dispatcher
- **Worker Engine** (`services/worker`): Distributed BullMQ Webhook Executor
- **Database & Cache**: PostgreSQL (Persistence) + Redis (Task Queue & Cache)

---

## 📐 System Architecture Diagram

```mermaid
flowchart TD
    Client["💻 React Dashboard (Client)"] -->|HTTP / Cookies| API["🚀 API Gateway (Node.js/Express)"]
    API -->|Persist Jobs| DB[(💾 PostgreSQL Database)]
    API -->|Enqueue Jobs| Redis[("⚡ Redis Queue Engine")]
    
    Scheduler["⏰ Scheduler Service"] -->|Poll & Schedule| DB
    Scheduler -->|Push Tasks| Redis
    
    Worker["⚙️ Task Worker Engine"] -->|Consume Tasks| Redis
    Worker -->|Execute Webhook| External["🌐 Target Webhook Endpoint"]
    Worker -->|Log Execution| DB
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **PostgreSQL**: `v15` or higher
- **Redis**: `v7` or higher
- **Docker & Docker Compose** *(Optional)*

---

### 1. Environment Setup

Copy `.env.example` to `.env` in the root and microservice directories:

```bash
# Root / Services Environment
PORT=8000
DATABASE_URL=postgresql://postgres:password123@localhost:5432/cronMaster
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

---

### 2. Local Installation

```bash
# Clone the repository
git clone https://github.com/your-username/cronmaster.git
cd cronmaster

# Install dependencies across services
npm install
npm --prefix client install
npm --prefix services/api install
npm --prefix services/scheduler install
npm --prefix services/worker install
```

---

### 3. Run Development Services

You can start the frontend client and backend services concurrently:

```bash
# Run Frontend Client (Vite Dev Server)
npm run client

# Run API Service
npm run dev

# Run Scheduler Service
npm run scheduler

# Run Worker Service
npm run worker
```

---

### 4. Running with Docker Compose

To spin up PostgreSQL, Redis, API, Scheduler, and Worker containers:

```bash
docker compose up --build
```

---

## 📡 API Reference Overview

| Endpoint | Method | Description | Auth Required |
|---|---|---|---|
| `/auth/register` | `POST` | Register new user account | ❌ No |
| `/auth/login` | `POST` | Authenticate user & receive cookies | ❌ No |
| `/auth/logout` | `POST` | Terminate active user session | 🔒 Yes |
| `/auth/me` | `GET` | Get logged-in user profile | 🔒 Yes |
| `/jobs` | `GET` | Retrieve user's scheduled cron jobs | 🔒 Yes |
| `/job` | `POST` | Create new cron job webhook | 🔒 Yes |
| `/job/:id` | `GET` | Fetch single cron job details | 🔒 Yes |
| `/job/:id` | `PUT` | Update cron job configuration or status | 🔒 Yes |
| `/job/:id` | `DELETE` | Delete cron job and purge pending queue | 🔒 Yes |
| `/metrics` | `GET` | Retrieve queue depth and concurrency metrics | ❌ No |

---

## 🛠️ Testing & Building

```bash
# Run production build for frontend
npm --prefix client run build

# Run ESLint verification
npm --prefix client run lint

# Validate Docker Compose config
docker compose config
```

---

## 📄 License

This project is licensed under the MIT License.
