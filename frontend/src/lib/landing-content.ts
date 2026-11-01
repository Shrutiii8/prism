/**
 * PRISM Landing Page Content & Data Layer
 * Strict rule: No hardcoded text inside JSX; centralized here.
 */

export interface BureauItem {
  id: string;
  cueNumber: string;
  code: string;
  name: string;
  subtitle: string;
  description: string;
  tags: string[];
  sampleCaseId: string;
  sampleStatus: string;
  sampleCategory: string;
}

export interface PlatformStage {
  step: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  specs: { label: string; value: string }[];
  highlightCode: string;
}

export interface UserPersona {
  role: string;
  title: string;
  tag: string;
  description: string;
  features: string[];
  mockUiHeader: string;
  mockUiStat: string;
  mockUiAction: string;
}

export interface ImpactRow {
  aspect: string;
  today: string;
  withPrism: string;
}

export interface SecurityTile {
  title: string;
  standard: string;
  description: string;
  iconName: "lock" | "shield" | "fileText" | "database" | "server";
}

export const LANDING_CONTENT = {
  meta: {
    title: "PRISM — Integrated Institution Complaint Monitoring and Coordination Platform",
    description:
      "A centralized regulatory oversight intelligence platform unifying complaint tracking across AICTE bureaus and regional offices into one institution case record.",
    org: "AICTE · Ministry of Education, Government of India",
    problemStatement: "Smart Automation",
  },

  hero: {
    eyebrow: "AICTE · INSTITUTION COMPLAINT MONITORING",
    headlineLine1: "Every complaint.",
    headlineLine2: "One institution.",
    headlineLine3: "One clock.",
    accentWord: "One clock.",
    subheadline:
      "PRISM unifies complaints across AICTE's Regulation Bureau, Public Grievance Redressal Cell, Regional Offices and every other Bureau into one secure, AI-assisted platform.",
    ctaPrimary: "Open the dashboard",
    ctaSecondary: "Track a complaint",
    metaRow: "Smart Automation · Software",
  },

  liveStats: [
    { label: "CASES TRACKED", value: "1,248", suffix: "", countUp: 1248 },
    { label: "BUREAUS CONNECTED", value: "5 + Regional", suffix: "", countUp: 5 },
    { label: "OVERLAPS FLAGGED", value: "342", suffix: "", countUp: 342 },
    { label: "STATUTORY SLA", value: "30 Days Max", suffix: "", countUp: 30 },
  ],

  statement:
    "A platform that treats an institution as one entity — not as a scattering of files in separate bureaus. We assign every complaint a case ID, an owner and a clock, and tell you when two bureaus are working the same institution.",

  cue01: {
    tag: "CUE 01",
    title: "Bureaus we connect",
    subtitle:
      "Bringing together parallel institutional inquiries into a single glass pane without altering bureau autonomy.",
    bureaus: [
      {
        id: "pgrc",
        cueNumber: "01",
        code: "PGRC",
        name: "Public Grievance Redressal Cell",
        subtitle: "Citizen, Student & Stakeholder Grievances",
        description:
          "Processes grievances concerning capitation fees, withheld certificates, arbitrary terminations, and fee reimbursement disputes.",
        tags: ["Student Rights", "Capitation Fee", "Staff Disputes"],
        sampleCaseId: "PGRC/2026/001023",
        sampleStatus: "Under Scrutiny",
        sampleCategory: "Fee Irregularity",
      },
      {
        id: "rb",
        cueNumber: "02",
        code: "RB",
        name: "Regulation Bureau",
        subtitle: "Norms, Standards & Regulatory Scrutiny",
        description:
          "Oversees institutional compliance with AICTE Approval Process Handbook (APH), land norms, built-up area ratios, and statutory councils.",
        tags: ["Norms Compliance", "APH Violations", "Land Ratios"],
        sampleCaseId: "RB/2026/004487",
        sampleStatus: "Explanation Sought",
        sampleCategory: "Infrastructure Non-Compliance",
      },
      {
        id: "academic",
        cueNumber: "03",
        code: "ACADEMIC",
        name: "Academic Bureau",
        subtitle: "Curricular Adherence & Faculty Standards",
        description:
          "Investigates deficiencies in 7th Pay Commission pay scales, unverified faculty qualifications, ghost faculty on payroll, and unapproved courses.",
        tags: ["Ghost Faculty", "Pay Commission", "Course Approvals"],
        sampleCaseId: "ACA/2026/006612",
        sampleStatus: "Panel Review",
        sampleCategory: "Faculty Shortage",
      },
      {
        id: "approval",
        cueNumber: "04",
        code: "APPROVAL",
        name: "Approval & Affiliation Bureau",
        subtitle: "Sanction Orders & Intake Thresholds",
        description:
          "Validates extension of approval (EoA), detects unauthorized intake expansion beyond approved quotas, and inspects fraudulent affiliations.",
        tags: ["Intake Expansion", "EoA Review", "Fraud Affiliation"],
        sampleCaseId: "AB/2026/002194",
        sampleStatus: "Hearing Scheduled",
        sampleCategory: "Unapproved Intake",
      },
      {
        id: "regional",
        cueNumber: "05",
        code: "REGIONAL",
        name: "Regional Offices",
        subtitle: "Northern, Southern, Eastern & Western Jurisdictions",
        description:
          "On-ground inspection committees (EVC/SAC), surprise physical audits, regional verification panels, and local state liaison.",
        tags: ["Surprise Inspection", "EVC Audits", "Physical Verification"],
        sampleCaseId: "RO-N/2026/000851",
        sampleStatus: "Inspection Complete",
        sampleCategory: "Lab Infrastructure",
      },
      {
        id: "external",
        cueNumber: "06",
        code: "OMNICHANNEL",
        name: "Direct & Omnichannel Intakes",
        subtitle: "CPGRAMS, Physical Letters, High Court Notices & Emails",
        description:
          "Automated digitization of incoming public grievance emails, CPGRAMS ministerial transfers, and physical registered post petitions.",
        tags: ["CPGRAMS", "Judicial Notices", "Direct Whistleblower"],
        sampleCaseId: "PRISM/2026/000994",
        sampleStatus: "Intake Verified",
        sampleCategory: "Whistleblower",
      },
    ] as BureauItem[],
  },

  cue02: {
    tag: "CUE 02",
    title: "The platform, end to end",
    subtitle:
      "A seven-layer pipeline designed for statutory rigor, audit durability, and high-concurrency complaint processing.",
    stages: [
      {
        step: "STAGE 01",
        number: "01",
        title: "Complaint Intake & Omnichannel Ingestion",
        tagline: "Unifying inputs across web portals, postal submissions, and central grievances.",
        description:
          "Every grievance received—whether via online form, CPGRAMS transfer, or regional physical dispatch—is assigned an immutable SHA-256 byte digest and registered into the ingestion queue.",
        specs: [
          { label: "Intake Latency", value: "< 250ms" },
          { label: "Format Support", value: "PDF, Scanned DOC, Text" },
          { label: "Anonymity Mode", value: "Cryptographic Salt" },
        ],
        highlightCode: "PRISM-INGEST::QUEUE_ACTIVE [200 OK]",
      },
      {
        step: "STAGE 02",
        number: "02",
        title: "Access & Integration Layer",
        tagline: "Role-scoped authentication, API gateway throttling, and sanitization.",
        description:
          "Validates requester identity via RFC 7519 JSON Web Tokens, sanitizes all input against OWASP injection vectors, and enforces strict rate limits.",
        specs: [
          { label: "Auth Protocol", value: "Argon2id + JWT" },
          { label: "Gateway Rate", value: "10,000 req/min" },
          { label: "RBAC Roles", value: "6 Enforced Tiers" },
        ],
        highlightCode: "GATEWAY::RBAC_AUTHORISED [ACCESS_TOKEN_VALID]",
      },
      {
        step: "STAGE 03",
        number: "03",
        title: "Institution Master & Enrichment",
        tagline: "Deterministic mapping to the AICTE Permanent Institution ID.",
        description:
          "Connects the grievance directly to the central Institution Registry. Maps permanent IDs (e.g., 1-100293841), historical approval records, past scrutiny notices, and geographical jurisdictions.",
        specs: [
          { label: "Registry Size", value: "50 Seeded Entities" },
          { label: "ID Verification", value: "AICTE Permanent ID" },
          { label: "Dossier Model", value: "360° Historical View" },
        ],
        highlightCode: "REGISTRY::LINKED_PERMANENT_ID [1-100293841]",
      },
      {
        step: "STAGE 04",
        number: "04",
        title: "Matching & Overlap Engine (AI + Rules)",
        tagline: "Multi-factor explainable correlation detecting duplicate allegations.",
        description:
          "Runs TF-IDF sublinear vectorization, token canonicalization, and institutional abbreviation expansion. Computes a multi-factor confidence score across 4 weighted dimensions.",
        specs: [
          { label: "Institution Weight", value: "40% (Exact & Token)" },
          { label: "Semantic Weight", value: "35% (TF-IDF N-grams)" },
          { label: "Category & Time", value: "25% Combined Weight" },
        ],
        highlightCode: "AI_ENGINE::CORRELATION_COMPUTED [SCORE: 0.88 - HIGH]",
      },
      {
        step: "STAGE 05",
        number: "05",
        title: "Unified Case Registry",
        tagline: "Independent case records linked by statutory relationship groups.",
        description:
          "Zero automatic merging or record deletion. Each grievance retains its assigned Case ID, evidence attachments, and jurisdictional authority while sharing systemic group intelligence.",
        specs: [
          { label: "ID Standard", value: "PRISM-YYYY-XXXXXX" },
          { label: "Record Autonomy", value: "Strict Independence" },
          { label: "Group Linkage", value: "Bidirectional Graph" },
        ],
        highlightCode: "CASE_REGISTRY::CASE_CREATED [PRISM-2026-000042]",
      },
      {
        step: "STAGE 06",
        number: "06",
        title: "Workflow & SLA Management",
        tagline: "10-stage regulatory pipeline with automatic managerial escalation.",
        description:
          "Monitors statutory turnaround clocks. Triggers Level 1 reminders to investigating officers, Level 2 escalation to section supervisors, and Level 3 alerts to Bureau Heads upon SLA breaches.",
        specs: [
          { label: "Workflow States", value: "10 Canonical Stages" },
          { label: "Level 1 Alert", value: "3 Days Prior to SLA" },
          { label: "Level 3 Escalation", value: "7 Days Overdue (Bureau Head)" },
        ],
        highlightCode: "SLA_MONITOR::ACTIVE [COMPLIANCE_RATE: 94.2%]",
      },
      {
        step: "STAGE 07",
        number: "07",
        title: "Executive Intelligence & Reports",
        tagline: "Live database-backed dashboards and 12 statutory export templates.",
        description:
          "Aggregates real-time grievance volume, institutional deficiency indices, officer workloads, and inter-bureau turnaround trends with instant official CSV exports.",
        specs: [
          { label: "Report Engines", value: "12 Pre-built Templates" },
          { label: "Export Format", value: "RFC 4180 CSV / Audit JSON" },
          { label: "Data Latency", value: "Live Database Reads" },
        ],
        highlightCode: "ANALYTICS::EXPORT_READY [12_REPORTS_STANDALONE]",
      },
    ] as PlatformStage[],
    readouts: [
      { label: "CONFIDENCE TIERS", value: "3", note: "High / Medium / Low" },
      { label: "UNIQUE CASE ID", value: "100%", note: "Per complaint record" },
      { label: "DUPLICATE MERGES", value: "0", note: "Preserves legal ownership" },
      { label: "STATUTORY BUREAUS", value: "5+", note: "Cross-agency coordinated" },
    ],
  },

  cue03: {
    tag: "CUE 03",
    title: "Overlap detection, live",
    subtitle:
      "Interactive multi-factor correlation engine demonstration. Drag to rotate nodes, adjust confidence cutoffs, and preview explainable similarity factors.",
    institution: {
      name: "Apex Institute of Technology & Engineering",
      aicteId: "1-100293841",
      location: "New Delhi, Delhi",
    },
    nodes: [
      {
        id: "pgrc-node",
        code: "PGRC",
        caseId: "PGRC/2026/001023",
        subject: "Capitation fee charged for direct B.Tech admissions",
        category: "Fee Irregularity",
        date: "14 Oct 2026",
        similarity: 0.88,
        color: "#10b981",
      },
      {
        id: "rb-node",
        code: "RB",
        caseId: "RB/2026/004487",
        subject: "Unapproved intake expansion of 60 seats in CS department",
        category: "Approval Violation",
        date: "19 Oct 2026",
        similarity: 0.74,
        color: "#f59e0b",
      },
      {
        id: "aca-node",
        code: "ACADEMIC",
        caseId: "ACA/2026/006612",
        subject: "Faculty shortage and non-compliance with 7th Pay Commission",
        category: "Faculty Shortage",
        date: "28 Oct 2026",
        similarity: 0.42,
        color: "#6b7280",
      },
    ],
    similarityBreakdown: [
      { factor: "Institution Permanent ID & Name Match", weight: "40%", score: 98, note: "Exact AICTE ID match" },
      { factor: "Semantic Description Similarity (TF-IDF)", weight: "35%", score: 84, note: "Overlapping allegations" },
      { factor: "Grievance Regulatory Category", weight: "15%", score: 75, note: "Statutory classification" },
      { factor: "Contextual & Temporal Proximity", weight: "10%", score: 92, note: "Submitted within 15 days" },
    ],
    caption:
      "Human verification always has the final word. Case records and statutory authority remain strictly independent across bureaus.",
  },

  cue04: {
    tag: "CUE 04",
    title: "Built for three kinds of users",
    subtitle:
      "Tailored operational workspaces engineered for regulators, institutional leadership, and the grievance-filing public.",
    personas: [
      {
        role: "AICTE Officials & Bureau Heads",
        title: "Executive Regulatory Console",
        tag: "FOR REGULATORS",
        description:
          "Monitor active bureau queues, assign cases based on live officer capacity, inspect AI overlap recommendations, and sign off on statutory recommendations.",
        features: [
          "Workload-aware officer case allocation",
          "Automated Level 1-3 SLA breach escalations",
          "12 live compliance reporting engines",
          "Inter-bureau coordination chat & joint inquiry",
        ],
        mockUiHeader: "RB Officer Workload: 6 / 12 Active",
        mockUiStat: "SLA Compliance: 94.2%",
        mockUiAction: "Assign Investigation Officer",
      },
      {
        role: "Educational Institutions",
        title: "Compliance & Response Portal",
        tag: "FOR INSTITUTIONS",
        description:
          "Respond directly to official show-cause notices, upload verified proof with cryptographic integrity digests, and review comprehensive 360° deficiency histories.",
        features: [
          "Single institutional 360° profile",
          "Direct evidence submission with SHA-256 validation",
          "Chronological inspection timeline",
          "Automated deadline warning notices",
        ],
        mockUiHeader: "Apex Inst of Tech (1-100293841)",
        mockUiStat: "3 Open Show-Cause Notices",
        mockUiAction: "Submit Compliance Response",
      },
      {
        role: "Students, Faculty & Whistleblowers",
        title: "Public Transparency & Tracking",
        tag: "FOR THE PUBLIC",
        description:
          "File complaints with optional cryptographic whistleblower anonymity, track real-time resolution stages with a unique Case ID, and verify disposals.",
        features: [
          "Sequential Case ID (PRISM-2026-XXXXXX)",
          "Whistleblower zero-knowledge privacy toggle",
          "4-stage transparent resolution stepper",
          "Direct SMS & in-app status notifications",
        ],
        mockUiHeader: "Case Tracking: PRISM-2026-000042",
        mockUiStat: "Stage: Investigation Pending",
        mockUiAction: "View Public Status Stepper",
      },
    ] as UserPersona[],
  },

  cue05: {
    tag: "CUE 05",
    title: "Impact: Before & with PRISM",
    subtitle:
      "Transforming fragmented, siloed complaint handoffs into a unified, transparent institutional governance ecosystem.",
    rows: [
      {
        aspect: "Institutional Visibility",
        today: "Scattered paper files and isolated portal tickets in separate bureaus.",
        withPrism: "One unified 360° institutional dossier aggregating all regulatory matters.",
      },
      {
        aspect: "Duplicate Allegations",
        today: "Similar complaints go unnoticed when institutional spellings or descriptions differ.",
        withPrism: "AI-assisted multi-factor entity matching alerts officers across bureaus.",
      },
      {
        aspect: "Bureau Coordination",
        today: "Parallel inspections and redundant show-cause notices issued independently.",
        withPrism: "Cross-bureau coordination workspace with joint inquiries and shared evidence.",
      },
      {
        aspect: "SLA & Accountability",
        today: "Manual follow-ups with untracked turnaround delays and lost files.",
        withPrism: "Automated 3-tier SLA escalation matrix with real-time managerial alarms.",
      },
      {
        aspect: "Audit & Compliance",
        today: "Fragmented spreadsheets with no immutable provenance or revision history.",
        withPrism: "Cryptographically hashed audit logs capturing every state transition and export.",
      },
    ] as ImpactRow[],
  },

  cue06: {
    tag: "CUE 06",
    title: "Security, compliance & governance",
    subtitle:
      "Architected under OWASP ASVS Level 2, GIGW 3.0 guidelines, and Digital Personal Data Protection (DPDP) Act compliance.",
    tiles: [
      {
        title: "Cryptographic Data Protection",
        standard: "AES-256 & SHA-256",
        description:
          "Data encrypted in transit and at rest. Every uploaded evidence document receives a cryptographic SHA-256 byte digest to prevent tampering.",
        iconName: "lock",
      },
      {
        title: "Role-Based Access Control",
        standard: "RFC 7519 JWT + Argon2id",
        description:
          "Strict backend authorization with 6 granular user roles. Ephemeral access tokens with rotating refresh tokens and server-side revocation.",
        iconName: "shield",
      },
      {
        title: "Immutable Compliance Audit Trail",
        standard: "Append-Only Event Store",
        description:
          "Every operational action, officer assignment, stage transition, and report export is logged with UTC timestamps, client IP, and correlation IDs.",
        iconName: "fileText",
      },
      {
        title: "Data Privacy & Whistleblower Safety",
        standard: "DPDP Act 2023 & GIGW 3.0",
        description:
          "Whistleblower anonymity toggle strips personal identifiable information while preserving legitimate complaint merits for regulatory action.",
        iconName: "database",
      },
      {
        title: "Scalable Enterprise Topology",
        standard: "FastAPI + PostgreSQL + Kafka",
        description:
          "Dockerized micro-architecture with async database IO, Redis caching for rapid metric calculation, and Kafka event streaming for inter-agency pub/sub.",
        iconName: "server",
      },
    ] as SecurityTile[],
  },

  techMarquee: [
    "Next.js 14 App Router",
    "TypeScript",
    "Tailwind CSS",
    "Python 3.11",
    "FastAPI ASGI",
    "SQLAlchemy 2.0",
    "PostgreSQL 16",
    "Scikit-Learn TF-IDF",
    "Sentence Transformers",
    "Redis 7",
    "Apache Kafka",
    "Argon2id Hashing",
    "SHA-256 Integrity",
    "Recharts",
    "Docker Compose",
    "Nginx Reverse Proxy",
    "OWASP ASVS Level 2",
    "GIGW 3.0 Standard",
  ],

  trackerMockCases: {
    "PGRC/2026/001023": {
      caseId: "PGRC/2026/001023",
      institution: "Apex Institute of Technology & Engineering",
      aicteId: "1-100293841",
      subject: "Capitation fee charged for direct B.Tech admissions",
      category: "Fee Irregularity",
      bureau: "Public Grievance Redressal Cell (PGRC)",
      dateReceived: "14 Oct 2026",
      currentStageIndex: 2, // 0: Received, 1: Under Scrutiny, 2: In Review, 3: Disposed
      stages: [
        { label: "Received", date: "14 Oct 2026", done: true },
        { label: "Under Scrutiny", date: "18 Oct 2026", done: true },
        { label: "In Review / Panel", date: "24 Oct 2026", done: true, current: true },
        { label: "Disposed / Regulatory Action", date: "Pending SLA", done: false },
      ],
      officerNote: "Joint inquiry recommended with Regulation Bureau regarding fee schedule verification.",
    },
    "PRISM-2026-000042": {
      caseId: "PRISM-2026-000042",
      institution: "Global Institute of Management Studies",
      aicteId: "1-209384912",
      subject: "Unapproved intake expansion in MBA batch 2026-28",
      category: "Approval Violation",
      bureau: "Regulation Bureau (RB)",
      dateReceived: "19 Oct 2026",
      currentStageIndex: 1,
      stages: [
        { label: "Received", date: "19 Oct 2026", done: true },
        { label: "Under Scrutiny", date: "22 Oct 2026", done: true, current: true },
        { label: "In Review / Panel", date: "Pending", done: false },
        { label: "Disposed / Regulatory Action", date: "Pending SLA", done: false },
      ],
      officerNote: "Show-cause notice dispatched to institution governing council.",
    },
  },

  finalCta: {
    headline: "Tell us the institution. PRISM finds the rest.",
    subheadline:
      "A single window into educational institutional compliance, grievance histories, and cross-bureau intelligence.",
    primaryButton: "Open the dashboard",
    secondaryButton: "Request an enterprise demo",
    footnote: "Built for AICTE",
  },

  footer: {
    columns: [
      {
        title: "Platform",
        links: [
          { label: "Executive Dashboard", href: "/login" },
          { label: "Central Case Directory", href: "/login" },
          { label: "Institution Registry", href: "/login" },
          { label: "AI Overlap Engine", href: "/login" },
          { label: "Statutory Reports", href: "/login" },
        ],
      },
      {
        title: "Regulatory References",
        links: [
          { label: "AICTE Official Portal", href: "https://www.aicte-india.org", external: true },
          { label: "CPGRAMS Redressal", href: "https://pgportal.gov.in", external: true },
          { label: "DARPG Guidelines", href: "https://darpg.gov.in", external: true },
          { label: "DPDP Act 2023", href: "https://www.meity.gov.in", external: true },
          { label: "GIGW 3.0 Compliance", href: "https://guidelines.gov.in", external: true },
        ],
      },
      {
        title: "System Access",
        links: [
          { label: "Official AICTE Login", href: "/login" },
          { label: "Institution Response Portal", href: "/login" },
          { label: "Track a Grievance", href: "#track" },
          { label: "OpenAPI Documentation", href: "http://127.0.0.1:8000/docs", external: true },
        ],
      },
      {
        title: "Compliance & Security",
        links: [
          { label: "AICTE Oversight Directive", href: "https://www.aicte-india.org", external: true },
          { label: "GIGW 3.0 Compliance", href: "https://guidelines.gov.in", external: true },
          { label: "DPDP Act 2023 Provisions", href: "https://www.meity.gov.in", external: true },
          { label: "Security & OWASP Matrix", href: "#security" },
        ],
      },
    ],
    legal: {
      copyright: "© 2026 PRISM Platform · Government of India / AICTE. All rights reserved.",
      subline: "All India Council for Technical Education (AICTE) · Central Regulatory Operations Platform.",
      terms: "Terms of Service",
      privacy: "Privacy Directive",
      security: "Vulnerability Disclosure",
    },
  },
};

