# CronMaster

> **Distributed Webhook Scheduler and Enterprise Cron Job Orchestration System**

CronMaster is a high-performance, fault-tolerant cron job and webhook scheduling platform designed for modern microservices architectures. Built with sub-millisecond queue concurrency, PostgreSQL persistence, Redis task distribution, and a React management dashboard.

---

## Key Features

- **Sub-Millisecond Scheduling**: Standard 5-part cron expression support with automated execution triggers.
- **Automated Webhook Retries**: Configurable exponential backoff retries (GET, POST, PUT, DELETE) with custom JSON payloads.
- **Interactive Gantt Execution Timeline**: Real-time duration telemetry, latency alignment, and status monitoring per job.
- **Job Configuration and Live Editing**: Real-time updating of job schedules, target URLs, HTTP methods, and payload bodies.
- **Secure Authentication**: JWT session management with HTTP-Only cookie security and protected routes.
- **Task Queue Resilience**: Redis and BullMQ task queues guaranteeing high availability and workload isolation.
- **Modern UI and UX**: Light, Dark, and System theme support powered by Tailwind CSS and responsive layouts.
- **High-Performance Architecture**: Code splitting with Rollup and route-level lazy loading for sub-100ms loading speeds.
- **CI/CD Ready**: Automated GitHub Actions workflows for continuous integration, linting, production builds, and Docker validation.

---

## Tech Stack Architecture

### Frontend
- **Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide Icons
- **State and Router**: React Router, Context API (`AuthContext`, `CronContext`, `ThemeContext`)
- **UI Components**: Interactive Gantt Timeline, Skeleton Loaders, Server Response Toast Alerts (`react-hot-toast`)
- **Optimization**: Rollup Manual Chunks (`vendor-react`, `vendor-icons`), Route `React.lazy` and `Suspense`

### Backend Services
- **API Service** (`services/api`): Node.js, Express, TypeScript, JWT, Cookie Parser
- **Scheduler Service** (`services/scheduler`): Node-Cron, BullMQ Queue Dispatcher, Advisory Locks
- **Worker Engine** (`services/worker`): Distributed BullMQ Webhook Executor with buffered execution flushing
- **Database and Cache**: PostgreSQL (Persistence) and Redis (Task Queue and Concurrency)

---

## System Architecture Diagram

```mermaid
flowchart TD
    Client["React Dashboard (Client)"] -->|HTTP / Cookies| API["API Gateway (Node.js/Express)"]
    API -->|Persist Jobs & Logs| DB[("PostgreSQL Database")]
    API -->|Enqueue Jobs| Redis[("Redis Queue Engine")]
    
    Scheduler["Scheduler Service"] -->|Poll & Advisory Lock| DB
    Scheduler -->|Push Tasks| Redis
    
    Worker["Task Worker Engine"] -->|Consume Tasks| Redis
    Worker -->|Execute Webhook| External["Target Webhook Endpoint"]
    Worker -->|Buffer & Flush Logs| DB
```

---

## Getting Started

### Prerequisites
- **Node.js**: `v20.x` or higher
- **PostgreSQL**: `v15` or higher
- **Redis**: `v7` or higher
- **Docker and Docker Compose** *(Optional)*

---

### 1. Environment Setup

Copy `.env.example` to `.env` in the root and service directories:

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

# Run API Gateway Service
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

## Testing and Building

```bash
# Run production build for frontend
npm --prefix client run build

# Run ESLint verification
npm --prefix client run lint

# Validate Docker Compose configuration
docker compose config
```

---

## License

This project is licensed under the MIT License.
