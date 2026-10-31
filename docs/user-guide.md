# PRISM Official User & Operational Manual

## 1. System Access & User Roles

PRISM enforces strict role-based access control. All standard test accounts share the initial password:
**`Prism@2026!`**

### Standard Provisioned Personas:
1. **Super Administrator**: `admin@prism.gov.in`
   - Complete platform control, user provisioning, system parameter calibration, and audit inspection.
2. **Central Administrator**: `central.admin@prism.gov.in`
   - Platform-wide grievance visibility, bottleneck identification, and cross-bureau escalation oversight.
3. **Bureau Head (Regulation Bureau)**: `head.rb@prism.gov.in`
   - Manages RB complaint queues, allocates cases to officers, and approves regulatory recommendations.
4. **Bureau Head (PGRC)**: `head.pgrc@prism.gov.in`
   - Oversees public grievance redressal cases and coordinates inter-bureau inquiries.
5. **Case Officer (RB Domain)**: `officer.rb1@prism.gov.in`
   - Conducts investigations, updates case notes, uploads evidence, and reviews AI correlation suggestions.
6. **Regional Officer (Northern Region)**: `regional.north@prism.gov.in`
   - Handles on-ground inspection panels, regional scrutiny, and local institutional compliance.
7. **Statutory Auditor**: `auditor@prism.gov.in`
   - Read-only oversight, inspection of chronological action logs, and compliance report generation.

---

## 2. Navigating the Executive Dashboard

Upon logging into PRISM, users are presented with the **Executive Dashboard**:
- **11 Real-Time KPI Cards**: Total Institutions, Total Complaints, Open Cases, Pending Investigation, Resolved Matters, Overdue Complaints, High Priority, Potentially Related Clusters, Unassigned Cases, Awaiting Approval, and Active Coordination Threads.
- **8 Dynamic Interactive Visualizations**:
  1. *Complaint Inflow Over Time* (Monthly area curve)
  2. *Complaints by Operating Bureau* (Comparative bar chart)
  3. *Stage & Resolution Distribution* (Color-coded pie chart)
  4. *Institution-Wise Volume Distribution* (Top deficient entities)
  5. *Severity Breakdown* (Critical, High, Medium, Low)
  6. *Monthly Resolution Trajectory* (Resolution throughput)
  7. *Overdue Cases by Bureau* (SLA risk tracking)
  8. *Officer Workload Matrix* (Caseload distribution)
- **Dynamic Scope Filters**: Instantly scope the dashboard by operational bureau or regional jurisdiction.

---

## 3. Institution Registry & 360° Profile

### 3.1 Searching and Filtering Institutions
- Navigate to **Institutions** via the sidebar navigation.
- Search by institution name, AICTE Permanent ID, state, or approval status.
- Export filtered institution directories directly to CSV.

### 3.2 Registering a New Institution with Duplicate Scrutiny
1. Click **Register Institution**.
2. Input the AICTE Permanent ID, Legal Institution Name, State, District, and Approval Status.
3. The platform performs real-time duplicate checks against existing records to prevent record fragmentation.

### 3.3 Exploring the 360° Institution Profile
Click on any institution to open its comprehensive dossier:
- **Header & Governance Info**: Permanent ID, Affiliated University, State, and Current Regulatory Status.
- **Aggregated Incident Metrics**: Total cases received across all bureaus, active open investigations, resolved count, and overdue breach counts.
- **Cross-Bureau Cases Table**: Consolidated listing of all complaints received by RB, PGRC, Approval Bureau, and Regional Offices.
- **Chronological Activity Timeline**: Audit history of previous inspections, explanation orders, and regulatory actions.

---

## 4. Complaint Management & Case Dossier

### 4.1 Registering a Grievance
1. Navigate to **Complaints** and click **Register Complaint**.
2. Select the target institution from the registry.
3. Choose the Receiving Bureau, Category (e.g., Approval-related, Capitation fee, Faculty shortage), Severity, and Priority.
4. Input the Grievance Subject and Description.
5. Toggle **Anonymous Complainant** if whistleblower confidentiality is required.
6. Submit to generate a unique sequential Case ID (e.g., `PRISM-2026-000001`).

### 4.2 Managing Case Investigations
Within the Case Dossier (`/complaints/[id]`):
- **Execute Workflow Transitions**: Move complaints through the 10 statutory stages with mandatory remarks.
- **Reassign Officer**: Adjust case allocation based on workload and expertise.
- **Upload Evidence**: Upload documents with automatic SHA-256 integrity digest calculation.
- **Collaboration Thread**: Post internal officer investigation notes.

---

## 5. AI Overlap Intelligence Workspace

**Fundamental Rule**: *PRISM never merges or deletes complaints automatically.*

1. Navigate to **AI Matching Intelligence** (`/ai-matching`).
2. Review candidate pairs detected by the multi-factor scoring engine (High, Medium, Low confidence).
3. Inspect the **Explainable Scoring Breakdown**:
   - Institution Token Similarity (40% weight)
   - Semantic Description Similarity (35% weight)
   - Category Match (15% weight)
   - Contextual Proximity (10% weight)
4. Compare complaint descriptions side-by-side.
5. Select **Confirm Relationship** (to formally link the cases into a systemic grievance group) or **Reject Match** (if coincidental).

---

## 6. Cross-Bureau Coordination

When a complaint involves multiple bureaus (e.g., PGRC receives a capitation fee complaint that requires RB regulatory action):
1. Navigate to **Bureau Coordination** (`/coordination`).
2. Create a Coordination Request specifying the initiating bureau, target bureau, and inquiry objective.
3. Exchange real-time inter-bureau messages and documentation within the coordination thread.
4. Update the status to `IN_PROGRESS`, `RESOLVED`, or `CLOSED`.

---

## 7. Workload-Aware Allocation Engine

1. Navigate to **Case Allocation** (`/allocation`).
2. View the live officer workload matrix displaying active cases, capacity thresholds, and bureau assignments.
3. Select unassigned complaints and allocate them to officers with optimal capacity.

---

## 8. Statutory Reports & Audit Compliance

### 8.1 Generating Reports (`/reports`)
Select from 12 official reporting templates:
- Institution Complaint Summary
- Bureau-Wise Volume & Turnaround
- Regional Office Distribution
- Grievance Category Matrix
- Severity & Priority Profile
- Officer Performance & Time-to-Close
- Bureau Workload Matrix
- Resolution Turnaround Metrics
- Overdue Complaints & Escalation Breaches
- Cross-Bureau Coordination Audit
- AI-Detected Overlap Clusters
- 12-Month Inflow & Outflow Trends

Click **Download Official CSV** for immediate export.

### 8.2 Inspecting the Audit Trail (`/audit`)
Filter immutable logs by Action, Resource Target, and User Email. Click **Inspect** to review client IP addresses, correlation IDs, and complete JSON change payloads.

