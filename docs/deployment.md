# PRISM Production Deployment & Operations Guide

## 1. System Requirements

### Hardware Requirements
- **CPU**: 4 vCPUs minimum (8 vCPUs recommended for concurrent AI overlap vector processing).
- **RAM**: 8 GB minimum (16 GB recommended for high-concurrency production deployments).
- **Disk Storage**: 50 GB SSD minimum for application code, PostgreSQL database files, and encrypted evidence attachments.

### Software Prerequisites
- Docker Engine version 24.0 or higher.
- Docker Compose version 2.20 or higher.
- Linux (Ubuntu 22.04 LTS / RHEL 9 recommended) or Windows Server with WSL2.

---

## 2. Quickstart Deployment (Docker Compose)

### 2.1 Clone and Environment Setup
```bash
# Clone the repository
git clone <repository_url> prism
cd prism

# Copy production environment configuration
cp .env.example .env

# Generate a cryptographically secure random secret key
python -c "import secrets; print(secrets.token_hex(32))"
# Update SECRET_KEY in .env with the generated output
```

### 2.2 Build and Launch Containers
```bash
# Build images and start services in detached mode
docker compose up -d --build

# Verify container health statuses
docker compose ps
```

The services will initialize in the following order:
1. `prism-postgres` (Port 5432)
2. `prism-redis` (Port 6379)
3. `prism-zookeeper` & `prism-kafka` (Port 9092)
4. `prism-backend` (Port 8000)
5. `prism-frontend` (Port 3000)
6. `prism-nginx` (Port 80 / 443)

### 2.3 Initial Database Seeding
To initialize the enterprise registry with standard bureaus, roles, workflow stages, 50 educational institutions, and 15 default user personas:
```bash
docker compose exec backend python scripts/seed_database.py
```

---

## 3. Standalone Local Development Deployment

If developing locally without Docker:

### 3.1 Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run initial seeding (uses local SQLite database)
python ../scripts/seed_database.py

# Launch FastAPI development server
uvicorn backend.app.main:app --reload --port 8000
```

### 3.2 Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Accessible at http://localhost:3000
```

---

## 4. Health Checks & System Monitoring

PRISM exposes production health check probes:

| Service | Check Command / Endpoint | Expected Response |
|---|---|---|
| **Backend API** | `GET http://localhost:8000/health` | `{"status": "healthy", "service": "PRISM", ...}` |
| **Frontend Web** | `GET http://localhost:3000` | HTTP 200 OK HTML payload |
| **PostgreSQL** | `pg_isready -U prism_admin -d prism_db` | `accepting connections` |
| **Redis Cache** | `redis-cli ping` | `PONG` |

---

## 5. Backup & Disaster Recovery Procedures

### 5.1 Automated Database Dump
```bash
docker compose exec postgres pg_dump -U prism_admin -d prism_db -F c -b -v -f /var/lib/postgresql/data/prism_backup_$(date +%Y%m%d).dump
```

### 5.2 Evidence Storage Backup
```bash
tar -czvf prism_evidence_backup_$(date +%Y%m%d).tar.gz storage/uploads/
```

### 5.3 Database Restoration
```bash
docker compose exec -T postgres pg_restore -U prism_admin -d prism_db -v /var/lib/postgresql/data/prism_backup_<DATE>.dump
```

