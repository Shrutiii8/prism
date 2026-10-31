# PRISM Relational Database Schema Specification

## 1. Schema Design Principles

The PRISM database architecture enforces:
- **UUIDv4 Primary Keys**: Non-sequential, collision-resistant primary keys across all tables.
- **Strict Referential Integrity**: Foreign keys with indexed lookup paths.
- **Temporal Traceability**: `created_at` and `updated_at` timestamps on all business entities.
- **Audit Immutability**: Dedicated append-only `audit_logs` table tracking mutations.
- **Structured JSON Payloads**: Standardized JSON columns for dynamic parameters, AI factor explanations, and audit diffs.

---

## 2. Entity Relationship Overview

```
                      +-------------------+
                      |   Institutions    |
                      +---------+---------+
                                | 1
                                |
                                | *
                      +---------+---------+
                      |    Complaints     |<-------+
                      +----+---------+----+        |
                           |         |             |
           +---------------+         +-------+     |
           | 1                     1 |       |     |
           v *                     v *       v *   v *
+--------------------+   +---------------+   +-------------------+
|  ComplaintActions  |   |   Evidence    |   |  AIMatchResults   |
+--------------------+   +---------------+   +-------------------+
```

---

## 3. Table Definitions

### 3.1 `institutions`
Central registry of higher education institutions subject to regulatory oversight.
- `id`: VARCHAR(36) PRIMARY KEY (UUIDv4)
- `aicte_id`: VARCHAR(64) UNIQUE NOT NULL (Permanent Regulatory ID)
- `name`: VARCHAR(255) NOT NULL
- `normalized_name`: VARCHAR(255) NOT NULL (Stripped of punctuation and honorific tokens)
- `institution_type`: VARCHAR(100) NOT NULL (e.g., Technical Institute, Management Institute)
- `address`: TEXT NOT NULL
- `state`: VARCHAR(100) NOT NULL (Indexed)
- `district`: VARCHAR(100) NOT NULL
- `city`: VARCHAR(100) NOT NULL
- `pincode`: VARCHAR(10) NOT NULL
- `affiliated_university`: VARCHAR(255)
- `approval_status`: VARCHAR(50) DEFAULT 'Approved' (Indexed)
- `approval_details`: JSON
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### 3.2 `complaints`
Core grievance records received across bureaus.
- `id`: VARCHAR(36) PRIMARY KEY (UUIDv4)
- `case_id`: VARCHAR(32) UNIQUE NOT NULL (Indexed; format: `PRISM-2026-XXXXXX`)
- `subject`: VARCHAR(500) NOT NULL
- `description`: TEXT NOT NULL
- `institution_id`: VARCHAR(36) NOT NULL (FK -> `institutions.id`, Indexed)
- `receiving_bureau_id`: VARCHAR(36) NOT NULL (FK -> `bureaus.id`, Indexed)
- `regional_office_id`: VARCHAR(36) (FK -> `regional_offices.id`, Indexed)
- `category_id`: VARCHAR(36) NOT NULL (FK -> `complaint_categories.id`, Indexed)
- `severity`: VARCHAR(20) DEFAULT 'MEDIUM' (Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `priority`: VARCHAR(20) DEFAULT 'MEDIUM' (Enum: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
- `date_received`: DATE NOT NULL (Indexed)
- `due_date`: DATE NOT NULL (Indexed)
- `complainant_name`: VARCHAR(255)
- `complainant_email`: VARCHAR(255)
- `complainant_phone`: VARCHAR(50)
- `complainant_is_anonymous`: BOOLEAN DEFAULT FALSE
- `assigned_officer_id`: VARCHAR(36) (FK -> `users.id`, Indexed)
- `current_stage_id`: VARCHAR(36) NOT NULL (FK -> `workflow_stages.id`, Indexed)
- `is_closed`: BOOLEAN DEFAULT FALSE (Indexed)
- `closed_at`: TIMESTAMP WITH TIME ZONE
- `closure_remarks`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### 3.3 `ai_match_results`
Calculated similarity correlations between pairs of complaints.
- `id`: VARCHAR(36) PRIMARY KEY (UUIDv4)
- `complaint_a_id`: VARCHAR(36) NOT NULL (FK -> `complaints.id`, Indexed)
- `complaint_b_id`: VARCHAR(36) NOT NULL (FK -> `complaints.id`, Indexed)
- `composite_score`: FLOAT NOT NULL (Indexed; Range: 0.0 - 1.0)
- `entity_match_score`: FLOAT NOT NULL
- `semantic_match_score`: FLOAT NOT NULL
- `category_match_score`: FLOAT NOT NULL
- `context_match_score`: FLOAT NOT NULL
- `match_classification`: VARCHAR(20) NOT NULL (Enum: `HIGH`, `MEDIUM`, `LOW`, Indexed)
- `match_explanation_json`: JSON
- `status`: VARCHAR(20) DEFAULT 'DETECTED' (Enum: `DETECTED`, `CONFIRMED`, `REJECTED`, Indexed)
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### 3.4 `coordination_requests`
Cross-bureau collaboration initiatives on overlapping or multi-jurisdictional matters.
- `id`: VARCHAR(36) PRIMARY KEY (UUIDv4)
- `complaint_id`: VARCHAR(36) NOT NULL (FK -> `complaints.id`, Indexed)
- `initiating_bureau_id`: VARCHAR(36) NOT NULL (FK -> `bureaus.id`)
- `target_bureau_id`: VARCHAR(36) NOT NULL (FK -> `bureaus.id`, Indexed)
- `requested_by_id`: VARCHAR(36) NOT NULL (FK -> `users.id`)
- `request_type`: VARCHAR(50) NOT NULL (e.g., `INFORMATION_REQUEST`, `JOINT_INQUIRY`, `TRANSFER`)
- `description`: TEXT NOT NULL
- `status`: VARCHAR(20) DEFAULT 'OPEN' (Enum: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`)
- `resolution_summary`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### 3.5 `complaint_evidence`
Cryptographically verified documents and evidence attachments.
- `id`: VARCHAR(36) PRIMARY KEY (UUIDv4)
- `complaint_id`: VARCHAR(36) NOT NULL (FK -> `complaints.id`, Indexed)
- `uploaded_by_id`: VARCHAR(36) NOT NULL (FK -> `users.id`)
- `file_name`: VARCHAR(255) NOT NULL
- `file_path`: VARCHAR(500) NOT NULL
- `file_size_bytes`: INTEGER NOT NULL
- `mime_type`: VARCHAR(100) NOT NULL
- `sha256_hash`: VARCHAR(64) NOT NULL (Cryptographic integrity check)
- `document_category`: VARCHAR(50) NOT NULL
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### 3.6 `audit_logs`
Statutory compliance and administrative action tracking.
- `id`: VARCHAR(36) PRIMARY KEY (UUIDv4)
- `user_id`: VARCHAR(36) (FK -> `users.id`, Indexed)
- `user_email`: VARCHAR(255)
- `user_role`: VARCHAR(50)
- `action`: VARCHAR(100) NOT NULL (Indexed)
- `resource_type`: VARCHAR(50) NOT NULL (Indexed)
- `resource_id`: VARCHAR(100) (Indexed)
- `change_details_json`: JSON
- `ip_address`: VARCHAR(45)
- `correlation_id`: VARCHAR(64) (Traceability identifier)
- `timestamp`: TIMESTAMP WITH TIME ZONE DEFAULT NOW() (Indexed)

