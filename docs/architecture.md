# PRISM Platform Architecture

## 1. Executive Summary

**PRISM** (Integrated Institution Complaint Monitoring and Coordination Platform) is an enterprise-grade regulatory oversight and coordination platform designed for centralized visibility into educational institution grievances received across disparate statutory bureaus and regional offices.

### Fundamental Architectural Tenet
**Complaints are never automatically merged or deleted.** Related grievances maintain independent case ownership, procedural timelines, and jurisdictional tracking. The platform employs an AI-assisted multi-factor correlation engine that computes semantic and entity-based overlap confidence scores, presenting actionable correlation dossiers to authorized regulatory officers for human verification, cross-bureau coordination, and linkage.

---

## 2. High-Level Component Topology

```
                                  +----------------------------------------------------+
                                  |                 Client Layer                       |
                                  | Next.js 14 App Router / React 18 / Tailwind CSS    |
                                  +-------------------------+--------------------------+
                                                            | HTTPS / WebSocket
                                                            v
                                  +----------------------------------------------------+
                                  |           Nginx Reverse Proxy & Gateway            |
                                  | - SSL/TLS Termination                              |
                                  | - OWASP Security Headers (CSP, HSTS, X-Frame)     |
                                  | - Rate Limiting & Gzip Compression                 |
                                  +------------+---------------------------+-----------+
                                               |                           |
                            Static Assets / UI |                           | REST API
                                               v                           v
                       +-------------------------------+   +-------------------------------+
                       |        Frontend Server        |   |      FastAPI ASGI Engine      |
                       |       Node.js 20 Runner       |   |      Python 3.11+ / Uvicorn   |
                       +-------------------------------+   +---------------+---------------+
                                                                           |
         +-----------------------------------------------------------------+--------------------------------------+
         |                                 |                               |                                      |
         v                                 v                               v                                      v
+------------------+             +-------------------+           +-------------------+                  +-------------------+
|  PostgreSQL 16   |             |   Redis 7 Cache   |           |   Apache Kafka    |                  |  AI Match Engine  |
| - Relational DB  |             | - Session Revocation|         | - Event Streaming |                  | - Scikit-Learn    |
| - UUID Primary   |             | - Rapid Metrics   |           | - Cross-Bureau    |                  | - TF-IDF N-grams  |
| - JSONB Payloads |             | - Rate Limiting   |           |   Pub/Sub Topics  |                  | - Token Expansion |
+------------------+             +-------------------+           +-------------------+                  +-------------------+
```

---

## 3. Core Subsystems

### 3.1 Client Layer (Frontend)
- **Framework**: Next.js 14 with App Router, TypeScript, and React 18.
- **Styling**: Tailwind CSS configured with official enterprise government color palettes (`gov-navy: #0f294a`, `gov-navy-light: #1e3a8a`, `gov-gold: #d97706`).
- **Data Visualizations**: Recharts integration with dynamic responsiveness for 8 distinct analytical charts on the Executive Dashboard.
- **State & Communication**: Centralized typed API client (`frontend/src/lib/api.ts`) managing token persistence, automatic Authorization header injection, and consistent error handling.

### 3.2 Application Layer (FastAPI Backend)
- **Framework**: FastAPI (ASGI) with async/await database IO.
- **Data Validation & Schemas**: Pydantic models for strict input validation, type coercion, and JSON schema generation.
- **Security**: Argon2id password hashing, HMAC-SHA256 file integrity calculation, and RFC 7519 JSON Web Tokens (JWT) with refresh token rotation and revocation.
- **Middleware**: Pure ASGI architecture providing real-time request timing, exception shielding, and security header injection.

### 3.3 Data Layer (SQLAlchemy 2.0 & PostgreSQL)
- **Engine**: Async SQLAlchemy 2.0 with `asyncpg` driver in production and `aiosqlite` in local development.
- **Entity Identification**: Canonical UUIDv4 strings for all primary keys to guarantee distributed uniqueness.
- **Audit Immutability**: Dedicated `audit_logs` table capturing every operational, transition, and export action with IP addresses and correlation IDs.

---

## 4. AI Overlap Intelligence Engine

PRISM implements an explainable multi-factor scoring algorithm to detect duplicate or correlated institutional complaints across different bureaus.

### Composite Scoring Formula:
$$\text{Score} = w_{\text{inst}} \cdot S_{\text{inst}} + w_{\text{sem}} \cdot S_{\text{sem}} + w_{\text{cat}} \cdot S_{\text{cat}} + w_{\text{ctx}} \cdot S_{\text{ctx}}$$

Where:
- $w_{\text{inst}} = 0.40$: Institution Match Weight (AICTE Permanent ID match yields $1.0$; fuzzy token overlap yields $0.65 - 0.90$).
- $w_{\text{sem}} = 0.35$: Semantic Text Similarity Weight (TF-IDF vectorization with sublinear term frequency and character $n$-grams over normalized descriptions).
- $w_{\text{cat}} = 0.15$: Regulatory Category Alignment Weight ($1.0$ for identical grievance classification).
- $w_{\text{ctx}} = 0.10$: Contextual & Temporal Proximity ($1.0$ if submitted within 30 days of each other).

### Classification Thresholds:
- **HIGH** ($\ge 0.75$): Strong probability of referring to the same underlying institutional incident. Surfaced prominently for immediate human verification.
- **MEDIUM** ($0.45 - 0.74$): Moderate similarity (e.g., identical institution with related or recurring compliance deficiencies).
- **LOW** ($< 0.45$): Distinct complaints; discarded from primary review queues to prevent officer alert fatigue.

---

## 5. Workflow State Machine

The complaint resolution process follows a deterministic 10-stage statutory state machine:

```
[SUBMITTED]
    |
    v
[REGISTERED] ----------> [CLOSED] (Direct rejection if invalid)
    |
    v
[UNDER_SCRUTINY]
    |
    v
[OFFICER_ASSIGNED]
    |
    v
[INVESTIGATION_PENDING]
    |
    v
[INSTITUTION_EXPLANATION_SOUGHT]
    |
    v
[REPORT_SUBMITTED]
    |
    v
[REGULATORY_ACTION_RECOMMENDED]
    |
    v
[RESOLVED]
    |
    v
[CLOSED]
```

### Transition Integrity & Access Control:
- Each stage change validates:
  1. Officer role permission (`require_roles`).
  2. Authorized originating and target stage mappings (`workflow_transitions`).
  3. Mandatory investigation remarks and audit logging.

