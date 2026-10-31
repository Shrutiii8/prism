# PRISM REST API Specification

## 1. Authentication & Security Architecture

All authenticated endpoints require a Bearer token in the HTTP `Authorization` header:
```http
Authorization: Bearer <jwt_access_token>
```

Tokens are signed using `HS256` and contain:
- `sub`: User UUID
- `email`: Official email address
- `role`: Role enum identifier (`SUPER_ADMIN`, `CENTRAL_ADMIN`, `BUREAU_HEAD`, `CASE_OFFICER`, `REGIONAL_OFFICER`, `AUDITOR`)
- `bureau_id`: Associated Bureau UUID (if assigned)
- `type`: `access` or `refresh`
- `exp`: Expiration timestamp (120 minutes for access tokens)

---

## 2. Authentication Endpoints

### 2.1 Login & Obtain Tokens
- **Endpoint**: `POST /api/v1/auth/login`
- **Access**: Public
- **Request Body (JSON)**:
  ```json
  {
    "email": "admin@prism.gov.in",
    "password": "Prism@2026!"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 7200,
    "user": {
      "id": "71bab6dd-f1ef-47f0-8d33-27bce190ef5a",
      "email": "admin@prism.gov.in",
      "full_name": "Dr. Rajesh Sharma",
      "role": "SUPER_ADMIN",
      "bureau_id": null
    }
  }
  ```

### 2.2 Current User Profile
- **Endpoint**: `GET /api/v1/auth/me`
- **Access**: Authenticated

### 2.3 Password Modification
- **Endpoint**: `POST /api/v1/auth/change-password`
- **Access**: Authenticated
- **Request Body**:
  ```json
  {
    "old_password": "CurrentPassword123!",
    "new_password": "NewStrongPassword456!"
  }
  ```

---

## 3. Institutions & 360° Profile

### 3.1 Directory Query
- **Endpoint**: `GET /api/v1/institutions`
- **Parameters**: `search`, `state`, `institution_type`, `approval_status`, `skip`, `limit`
- **Response**: Paginated list of institutions with aggregated complaint metrics.

### 3.2 360° Institution Profile
- **Endpoint**: `GET /api/v1/institutions/{institution_id}`
- **Response**: Complete institutional record including all linked complaints across all bureaus, severity breakdown, regulatory actions, and chronological timeline.

### 3.3 Real-Time Duplicate Scrutiny
- **Endpoint**: `GET /api/v1/institutions/check-duplicate`
- **Parameters**: `aicte_id`, `name`, `state`
- **Response**:
  ```json
  {
    "has_duplicate": true,
    "matches": [
      {
        "id": "inst-uuid-1",
        "name": "Apex Institute of Technology & Engineering",
        "aicte_id": "1-100293841",
        "state": "Delhi",
        "similarity": 1.0
      }
    ]
  }
  ```

---

## 4. Complaints & Case Lifecycle

### 4.1 Register New Complaint
- **Endpoint**: `POST /api/v1/complaints`
- **Access**: Authorized personnel
- **Request Body**:
  ```json
  {
    "subject": "Unauthorized 50% Intake Expansion in Computer Science",
    "description": "Institution admitted 180 students against approved capacity of 120 without mandatory clearance.",
    "institution_id": "inst-uuid-1",
    "receiving_bureau_id": "bureau-uuid-rb",
    "category_id": "cat-uuid-approval",
    "severity": "HIGH",
    "priority": "HIGH",
    "complainant_name": "Anonymous Faculty Member",
    "complainant_is_anonymous": true
  }
  ```
- **Response**: Returns created case with auto-generated Case ID (`PRISM-2026-000001`).

### 4.2 Execute Stage Transition
- **Endpoint**: `POST /api/v1/complaints/{id}/transition`
- **Request Body**:
  ```json
  {
    "to_stage_id": "stage-uuid-officer-assigned",
    "remarks": "Assigned to regional inspection panel."
  }
  ```

### 4.3 Reassign Case Officer
- **Endpoint**: `POST /api/v1/complaints/{id}/assign`
- **Request Body**:
  ```json
  {
    "assigned_to_id": "user-uuid-officer",
    "assignment_reason": "Specialized domain investigator for regulatory compliance."
  }
  ```

---

## 5. AI Overlap Intelligence Engine

### 5.1 Retrieve Correlation Matches
- **Endpoint**: `GET /api/v1/ai/matches`
- **Parameters**: `classification` (`HIGH`, `MEDIUM`, `LOW`), `status` (`DETECTED`, `CONFIRMED`, `REJECTED`)
- **Response**: List of candidate complaint pairs with composite score, breakdown factors, and match explanations.

### 5.2 Officer Review (Human-in-the-Loop)
- **Endpoint**: `POST /api/v1/ai/matches/{id}/review`
- **Request Body**:
  ```json
  {
    "action": "CONFIRM",
    "comments": "Confirmed correlation. Both complaints pertain to identical unauthorized course batch.",
    "relationship_type": "DUPLICATE_INCIDENT"
  }
  ```

### 5.3 Batch Correlation Scan
- **Endpoint**: `POST /api/v1/ai/scan-all`
- **Access**: `SUPER_ADMIN`, `CENTRAL_ADMIN`

---

## 6. Cross-Bureau Coordination

### 6.1 Initiate Request
- **Endpoint**: `POST /api/v1/coordination`
- **Request Body**:
  ```json
  {
    "complaint_id": "complaint-uuid",
    "target_bureau_id": "bureau-uuid-pgrc",
    "request_type": "JOINT_INQUIRY",
    "description": "Requesting joint scrutiny regarding capitation fee records during inspection."
  }
  ```

### 6.2 Post Message in Coordination Thread
- **Endpoint**: `POST /api/v1/coordination/{request_id}/messages`

---

## 7. Evidence Management

### 7.1 Upload Evidence Document
- **Endpoint**: `POST /api/v1/evidence/upload`
- **Content-Type**: `multipart/form-data`
- **Form Fields**: `complaint_id`, `document_category`, `file`
- **Integrity**: Backend calculates cryptographic SHA-256 hash immediately upon receipt.

### 7.2 Download Evidence File
- **Endpoint**: `GET /api/v1/evidence/download/{id}`
- **Security**: Verifies stored SHA-256 integrity hash prior to streaming file bytes.

