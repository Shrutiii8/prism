# PRISM Security & Access Governance Architecture

## 1. Security Overview

PRISM is designed as a mission-critical enterprise regulatory system with defense-in-depth principles adhering to the OWASP Application Security Verification Standard (ASVS) Level 2.

---

## 2. Cryptographic Controls & Password Storage

### 2.1 Password Hashing (Argon2id)
All user passwords are encrypted using **Argon2id** (via Python's `passlib[argon2]` implementation) with the following parameters:
- Algorithm: `argon2id`
- Memory cost ($m$): 65,536 KiB (64 MiB)
- Time cost ($t$): 3 iterations
- Parallelism ($p$): 4 threads
- Salt: 16 cryptographically secure random bytes generated via `os.urandom()`

Legacy or unsalted algorithms (MD5, SHA1, plain SHA256) are strictly prohibited.

### 2.2 JWT Token Management & Revocation
- **Access Tokens**: Ephemeral tokens signed using HMAC-SHA256 (`HS256`) with a 120-minute lifespan.
- **Refresh Tokens**: Cryptographically random 7-day tokens with automatic rotation upon re-authentication.
- **Session Revocation**: Stored tokens can be invalidated dynamically across active sessions via the centralized `/auth/logout` endpoint.

### 2.3 Evidence File Integrity (SHA-256)
All uploaded documents and investigative records are digested into a SHA-256 checksum at the byte level before persistence:
$$\text{Checksum} = \text{SHA256}(\text{File Bytes})$$
Prior to serving any file for download, the stored SHA-256 hash is recalculated and compared to prevent unauthorized storage tampering or bit-rot corruption.

---

## 3. Role-Based Access Control (RBAC) Matrix

PRISM enforces backend authorization on all endpoints via `require_roles(...)` and permission checks:

| Role | Manage Users | Register Complaint | Assign Officer | Stage Transition | AI Review | Cross-Bureau Coordination | View Audit Logs | Export Reports |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Super Administrator** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Central Administrator**| ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bureau Head** | ❌ | ✅ | ✅ (Own Bureau) | ✅ (Own Bureau) | ✅ | ✅ | ❌ | ✅ |
| **Case Officer** | ❌ | ✅ | ❌ | ✅ (Assigned) | ✅ (Recommend)| ✅ | ❌ | ❌ |
| **Regional Officer** | ❌ | ✅ | ❌ | ✅ (Regional) | ❌ | ✅ | ❌ | ❌ |
| **Auditor** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 4. OWASP Top 10 Protections

### 4.1 Injection Mitigation (A03:2021)
- **SQL Injection**: Prevented comprehensively via SQLAlchemy 2.0 object-relational mapping and parameterized queries. No raw SQL strings or string formatting are used for query construction.
- **Cross-Site Scripting (XSS)**: Handled via React's automatic contextual escaping in Next.js. Dynamic HTML injection (`dangerouslySetInnerHTML`) is entirely disallowed.

### 4.2 Broken Access Control (A01:2021)
- Every resource modification endpoint inspects both the user's role and their operational jurisdiction (e.g., ensuring a Bureau Head can only reassign complaints belonging to their designated bureau).
- Client-side navigation guards are strictly cosmetic; all authoritative decisions occur in FastAPI dependencies (`backend/app/core/dependencies.py`).

### 4.3 Security Misconfiguration (A05:2021)
Production Nginx gateway injects recommended OWASP headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: default-src 'self' ...`

---

## 5. Non-Repudiation & Audit Trail

The `audit_logs` subsystem captures all state transitions, user logins, evidence uploads, officer assignments, AI correlation confirmations, and statutory report exports.

Each log entry records:
1. `user_id` & `user_email`
2. Assigned role at the time of execution
3. High-resolution UTC timestamp
4. Client IP address (`X-Forwarded-For` or `remote_addr`)
5. Target `resource_type` and `resource_id`
6. Cryptographic `correlation_id` across distributed service requests
7. Complete before/after diff payload serialized in JSON

