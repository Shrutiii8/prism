# PRISM: Integrated Institution Complaint Monitoring and Coordination Platform

**PRISM** is a centralized institution-centric regulatory complaint monitoring and coordination platform designed to unify complaint processing, regulatory oversight, and inter-agency coordination across organizational units, including:

- **Regulation Bureau (RB)**
- **Public Grievance Redressal Cell (PGRC)**
- **Approval Bureau (AB)**
- **Vigilance Cell (VC)**
- **Regional Offices (North, South, East, West)**
- **Central Directorate & Statutory Oversight Committees**

The platform eliminates fragmented complaint tracking, provides centralized visibility into institutions' historical compliance records, calculates AI-assisted correlations for overlapping grievances without altering case ownership, coordinates inter-bureau investigations, and enforces statutory turnaround deadlines.

---

## 1. Fundamental Business Rule

> **Complaints are never automatically merged or deleted.**
> 
> Related complaints received by different bureaus or regional offices remain independent case records with distinct Case IDs, case officers, evidence chains, and procedural timelines. PRISM computes explainable semantic and entity-based correlation confidence scores to surface potential relationships, empowering authorized officers to verify, link, coordinate, and jointly address systemic institutional issues.

---

## 2. Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS configured with official enterprise government color palette (`gov-navy: #0f294a`, `gov-gold: #d97706`, `gov-slate: #f8fafc`)
- **Visualizations**: Recharts dynamic charting library for live database-backed executive analytics
- **Icons**: Lucide React
- **API Client**: Centralized typed REST client with automatic Bearer token injection, session refresh, and error handling

### Backend
- **Framework**: Python 3.11+ / FastAPI (ASGI)
- **Validation**: Pydantic v2 schemas for request validation and response serialization
- **Database Engine**: SQLAlchemy 2.0 (Async/Await architecture)
- **Databases**:
  - **Production**: PostgreSQL 16 (UUID primary keys, indexed foreign keys, JSONB parameters)
  - **Development / Standalone**: SQLite 3 with `aiosqlite`
- **Authentication**: JWT access tokens (120-minute expiry) with cryptographically rotating refresh tokens
- **Password Encryption**: Argon2id hashing via `passlib[argon2]`
- **File Integrity**: Cryptographic SHA-256 byte hashing on evidence uploads

### AI & Intelligence Engine
- **Text Normalization**: Regex-based canonicalization and educational abbreviation expansion (e.g., *Inst of Tech* $\rightarrow$ *Institute of Technology*, *Engg* $\rightarrow$ *Engineering*, *Univ* $\rightarrow$ *University*)
- **Entity Matching**: Exact AICTE Permanent ID matching combined with fuzzy token Jaccard similarity
- **Semantic Text Similarity**: Scikit-Learn TF-IDF vectorization with sublinear term frequency scaling and word/character $n$-grams
- **Explainable Scoring**: Multi-factor scoring formula with granular factor decomposition and human-readable match explanations

### Infrastructure & Operations
- **Containerization**: Multi-stage production `Dockerfile`s for frontend and backend
- **Orchestration**: `docker-compose.yml` deploying PostgreSQL, Redis, Apache Kafka, Zookeeper, FastAPI backend, Next.js frontend, and Nginx
- **Reverse Proxy**: Nginx with OWASP security headers (`Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`) and gzip compression
- **Event Streaming**: Apache Kafka development broker integration for event-driven coordination pub/sub

---

## 3. High-Level Architecture

```
+-----------------------------------------------------------------------------------+
|                                  Client Terminals                                 |
|                       Next.js 14 / TypeScript / Tailwind CSS                      |
+-----------------------------------------+-----------------------------------------+
                                          | HTTPS
                                          v
+-----------------------------------------------------------------------------------+
|                            Nginx Reverse Proxy Gateway                            |
|             (OWASP Security Headers / Rate Limiting / TLS Termination)            |
+--------------------+---------------------------------------------+----------------+
                     | /                                           | /api/v1/
                     v                                             v
+-----------------------------------------+   +-------------------------------------+
|             Frontend Server             |   |         FastAPI ASGI Engine         |
|            Node.js 20 Runner            |   |          Python 3.11 / Uvicorn      |
+-----------------------------------------+   +------------------+------------------+
                                                                 |
                   +---------------------------------------------+------------------------------------+
                   |                              |                              |                    |
                   v                              v                              v                    v
+------------------------------------+ +--------------------+ +--------------------+ +----------------+
|       PostgreSQL 16 Database       | |    Redis 7 Cache   | | Apache Kafka Bus   | | AI Overlap     |
| - 50 Seeded Institutions           | | - Token Revocation | | - Event Streaming  | |   Engine       |
| - 150 Seeded Complaints            | | - Session Stores   | | - Inter-Agency     | | - TF-IDF Vector|
| - 10-Stage Workflow State Machine  | | - Rapid Metrics    | |   Coordination     | | - Explainable  |
| - Immutable Audit Trail            | |                    | |   Events           | |   Scoring      |
+------------------------------------+ +--------------------+ +--------------------+ +----------------+
```

---

## 4. Platform Modules

1. **Authentication & User Governance**: Argon2id hashing, RFC 7519 JWT auth, role/bureau scoping, and active caseload tracking.
2. **Executive Dashboard**: 11 real-time KPI metrics and 8 live Recharts analytical charts (Inflow trends, Bureau distribution, Stage breakdown, Deficient institutions, Severity profile, Resolution pace, Overdue cases, Officer caseloads).
3. **Centralized Institution Registry**: Directory of higher education entities with AICTE Permanent IDs, geographic mapping, CSV import/export, and real-time duplicate detection.
4. **Institution 360° Profile**: Information-dense dossier displaying all cross-bureau complaints, severity breakdowns, regulatory actions, and chronological timelines.
5. **Complaint Management Lifecycle**: Automated sequential Case IDs (`PRISM-2026-XXXXXX`), whistleblower anonymity mode, dynamic SLA calculation, and officer assignment.
6. **AI Overlap Intelligence Engine**: Composite scoring ($40\%$ Institution, $35\%$ Semantic text, $15\%$ Category, $10\%$ Contextual proximity) with side-by-side comparison and human verification.
7. **Related Cases & Systemic Groups**: Manages clusters of correlated complaints linked to underlying institutional non-compliance while preserving independent case records.
8. **Workload-Aware Case Allocation**: Officer capacity matrix displaying active caseloads against maximum thresholds for balanced workload distribution.
9. **Cross-Bureau Coordination Workspace**: Formal inter-bureau coordination requests with threaded messaging and state tracking between RB, PGRC, and Regional Offices.
10. **Statutory 10-Stage Workflow State Machine**: Deterministic transitions with mandatory investigation remarks and role permission validation.
11. **Evidence Management & Cryptographic Integrity**: File uploads stored with automatic SHA-256 byte digest verification.
12. **Executive Reporting & Compliance Suite**: 12 standardized reporting engines with instant database aggregation and official CSV exports.
13. **Immutable Audit Trail**: Append-only log recording all user actions, client IP addresses, correlation IDs, and JSON before/after state diffs.
14. **System Calibration & Policy Rules**: Dynamic administrative controls for AI similarity scoring weights, confidence thresholds, and SLA escalation policies.

---

## 5. Standard Test Credentials

All pre-seeded user accounts share the password:
**`Prism@2026!`**

| Role | Name | Official Email | Bureau / Jurisdiction |
|---|---|---|---|
| **Super Administrator** | Dr. Rajesh Sharma | `admin@prism.gov.in` | All Bureaus / National Headquarters |
| **Central Administrator** | Smt. Sunita Verma | `central.admin@prism.gov.in` | Central Directorate & Oversight |
| **Bureau Head** | Shri Alok Mukherjee | `head.rb@prism.gov.in` | Regulation Bureau (RB) |
| **Bureau Head** | Dr. Kavita Nair | `head.pgrc@prism.gov.in` | Public Grievance Redressal Cell (PGRC) |
| **Case Officer** | Vikram Singh | `officer.rb1@prism.gov.in` | Regulation Bureau (RB) |
| **Case Officer** | Priya Sundaram | `officer.rb2@prism.gov.in` | Regulation Bureau (RB) |
| **Case Officer** | Amit Patel | `officer.pgrc1@prism.gov.in` | Public Grievance Redressal Cell (PGRC) |
| **Regional Officer** | Dr. R. K. Joshi | `regional.north@prism.gov.in` | Northern Regional Office (RO-N) |
| **Regional Officer** | K. G. Swaminathan | `regional.south@prism.gov.in` | Southern Regional Office (RO-S) |
| **Statutory Auditor** | Neha Sengupta | `auditor@prism.gov.in` | National Compliance Audit Cell |

---

## 6. Quickstart Instructions

### Option A: Local Standalone Execution (Fastest)

#### 1. Backend Setup:
From the project root:
```bash
# Using the pre-configured virtual environment:
python run_backend.py
# (Or on Windows: double-click start_backend.bat)
```

Alternatively, to run manually with uvicorn:
```bash
# From project root:
backend\.venv\Scripts\uvicorn backend.app.main:app --reload --port 8000
```
API Documentation will be live at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

#### 2. Run Backend Verification Suite:
In a separate terminal:
```bash
backend\.venv\Scripts\python scripts/verify_backend.py
```
*Validates all 11 comprehensive test suites against the live API.*

#### 3. Frontend Setup:
In a separate terminal:
```bash
cd frontend
npm run dev
# (Or on Windows: double-click start_frontend.bat)
```
Access the application portal at: `http://localhost:3000`

---

### Option B: Docker Compose Deployment (Production Configuration)

```bash
# Clone and prepare environment
cp .env.example .env

# Build and start all services
docker compose up -d --build

# Run database seeding inside container
docker compose exec backend python scripts/seed_database.py

# View running container statuses
docker compose ps
```

The application will be accessible through the Nginx gateway at `http://localhost`.

---

## 7. Testing & Verification

### Running Automated Unit & Integration Tests
```bash
# Backend pytest suite
pytest -v

# Run the live API verification suite
python scripts/verify_backend.py
```

### Postman API Collection
Import `postman/PRISM_API_Collection.json` into Postman. It includes pre-configured authorization scripts that automatically set the `authToken` collection variable upon executing the *Login SuperAdmin* request.

---

## 8. Directory Structure

```
prism/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # REST API route handlers
│   │   ├── core/            # Database engine, config, security, dependencies
│   │   ├── ml/              # AI overlap matching engine (TF-IDF & token scoring)
│   │   ├── models/          # SQLAlchemy 2.0 database models
│   │   ├── schemas/         # Pydantic v2 validation schemas
│   │   └── services/        # Business logic services
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js 14 App Router pages
│   │   │   ├── ai-matching/ # AI overlap intelligence workspace
│   │   │   ├── allocation/  # Workload-aware case allocation
│   │   │   ├── audit/       # Immutable compliance audit log viewer
│   │   │   ├── complaints/  # Grievance registry, dossier, and new form
│   │   │   ├── coordination/# Cross-bureau inter-agency collaboration
│   │   │   ├── dashboard/   # Executive dashboard with 8 Recharts visualizers
│   │   │   ├── institutions/# Registry, duplicate scrutiny, and 360 profile
│   │   │   ├── login/       # Login portal with role quick-selector
│   │   │   ├── reports/     # 12 statutory report generators & CSV export
│   │   │   ├── settings/    # AI weights & SLA policy calibration
│   │   │   └── users/       # Personnel directory & role provisioning
│   │   ├── components/      # Shared UI layout and navigation components
│   │   └── lib/             # Typed REST API client
│   ├── Dockerfile
│   ├── package.json
│   └── tailwind.config.ts
├── docs/                    # Complete architectural and operational guides
│   ├── architecture.md
│   ├── api-documentation.md
│   ├── database-schema.md
│   ├── deployment.md
│   ├── security.md
│   └── user-guide.md
├── infrastructure/
│   └── nginx/
│       └── nginx.conf       # OWASP-hardened reverse proxy configuration
├── postman/
│   └── PRISM_API_Collection.json
├── scripts/
│   ├── seed_database.py     # Comprehensive database provisioning script
│   └── verify_backend.py    # Live API verification test runner
├── docker-compose.yml
└── README.md
```

---

## 9. Security & Compliance Declarations

- **OWASP ASVS Level 2 Conformance**: Role-based access control enforced on all endpoints; parameterized ORM queries; no direct execution of untrusted input.
- **Cryptographic Standards**: Argon2id password hashing; SHA-256 evidence integrity hashing; RFC 7519 JWT authentication.
- **Data Integrity**: Append-only audit trail logging user identity, IP address, correlation ID, and change diffs.
- **Synthetic Data**: All pre-seeded institutions and complaint records represent realistic synthetic data generated solely for system operational readiness.

