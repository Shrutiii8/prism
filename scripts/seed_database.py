import os
import sys
import random
import uuid
from datetime import datetime, timedelta, timezone

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.app.core.database import sync_engine, Base, SyncSessionLocal
from backend.app.core.security import hash_password, compute_sha256_file
from backend.app.models import (
    User, Role, Permission, RolePermission, Bureau, RegionalOffice,
    Institution, InstitutionIdentifier, InstitutionContact,
    Complaint, ComplaintCategory, ComplaintAssignment, ComplaintStatusHistory,
    ComplaintComment, ComplaintRelationship, RelatedCaseGroup, RelatedCaseGroupMember,
    AIMatchResult, AIMatchReview, WorkflowDefinition, WorkflowStage, WorkflowTransition,
    CoordinationRequest, CoordinationMessage, ComplaintEvidence, Notification,
    EscalationPolicy, EscalationEvent, AuditLog, SystemSetting
)
from backend.app.ml.matching_engine import normalize_text, matching_engine

def seed_database():
    print("Beginning PRISM Database Provisioning and Synthetic Seeding...")
    Base.metadata.create_all(bind=sync_engine)
    session = SyncSessionLocal()

    try:
        # Check if already seeded
        existing_users = session.query(User).count()
        if existing_users > 0:
            print(f"Database already contains {existing_users} users. Skipping initial seed.")
            return

        now = datetime.now(timezone.utc)

        # 1. PERMISSIONS
        print("1. Creating Permissions...")
        perm_defs = [
            ("user:read", "View Users", "USER"),
            ("user:write", "Manage Users", "USER"),
            ("institution:read", "View Institutions", "INSTITUTION"),
            ("institution:write", "Manage Institutions", "INSTITUTION"),
            ("complaint:read", "View Complaints", "COMPLAINT"),
            ("complaint:write", "Create/Edit Complaints", "COMPLAINT"),
            ("complaint:assign", "Assign Cases", "COMPLAINT"),
            ("complaint:transition", "Change Workflow Stage", "COMPLAINT"),
            ("ai:view", "View AI Similarity Matches", "AI"),
            ("ai:verify", "Verify/Reject AI Relationships", "AI"),
            ("coordination:read", "View Cross-Bureau Coordination", "COORDINATION"),
            ("coordination:write", "Initiate Coordination", "COORDINATION"),
            ("evidence:read", "View Evidence", "EVIDENCE"),
            ("evidence:upload", "Upload Evidence", "EVIDENCE"),
            ("report:read", "View Analytics & Reports", "REPORT"),
            ("report:export", "Export Reports", "REPORT"),
            ("audit:read", "View Audit Logs", "AUDIT"),
            ("settings:write", "Configure System Settings", "SETTINGS"),
        ]
        permissions_map = {}
        for code, name, cat in perm_defs:
            p = Permission(code=code, name=name, category=cat)
            session.add(p)
            permissions_map[code] = p
        session.flush()

        # 2. ROLES
        print("2. Creating Standard Enterprise Roles...")
        roles_defs = {
            "SUPER_ADMIN": ("Super Administrator", "Complete platform access and configuration control", list(permissions_map.keys())),
            "CENTRAL_ADMIN": ("Central Administrator", "Platform-wide monitoring, cross-bureau coordination, and analytics", [
                "user:read", "institution:read", "institution:write", "complaint:read", "complaint:write",
                "complaint:assign", "complaint:transition", "ai:view", "ai:verify", "coordination:read",
                "coordination:write", "evidence:read", "evidence:upload", "report:read", "report:export", "audit:read"
            ]),
            "BUREAU_HEAD": ("Bureau Head", "Bureau-level management, case assignments, approvals and coordination", [
                "institution:read", "complaint:read", "complaint:write", "complaint:assign", "complaint:transition",
                "ai:view", "ai:verify", "coordination:read", "coordination:write", "evidence:read", "evidence:upload",
                "report:read", "report:export"
            ]),
            "CASE_OFFICER": ("Case Officer", "Investigation, case status updates, evidence management and linking", [
                "institution:read", "complaint:read", "complaint:write", "complaint:transition", "ai:view",
                "ai:verify", "coordination:read", "coordination:write", "evidence:read", "evidence:upload"
            ]),
            "REGIONAL_OFFICER": ("Regional Officer", "Regional jurisdiction complaint management and local inquiries", [
                "institution:read", "complaint:read", "complaint:write", "complaint:transition", "evidence:read",
                "evidence:upload", "coordination:read", "coordination:write"
            ]),
            "AUDITOR": ("Auditor / Compliance Officer", "Read-only audit inspection, compliance tracking and reporting", [
                "institution:read", "complaint:read", "ai:view", "coordination:read", "evidence:read",
                "report:read", "report:export", "audit:read"
            ])
        }
        roles_map = {}
        for r_name, (display, descr, p_codes) in roles_defs.items():
            role = Role(name=r_name, display_name=display, description=descr, is_system=True)
            for p_code in p_codes:
                if p_code in permissions_map:
                    role.permissions.append(permissions_map[p_code])
            session.add(role)
            roles_map[r_name] = role
        session.flush()

        # 3. BUREAUS
        print("3. Creating Bureaus and Cells...")
        bureaus_data = [
            ("RB", "Regulation Bureau", "Responsible for enforcement of statutory regulations, standards and institutional compliance."),
            ("PGRC", "Public Grievance Redressal Cell", "Dedicated cell for citizen, student, and faculty grievances redressal."),
            ("APPROVAL", "Approval Bureau", "Processes institution approvals, extension of approvals, and course authorizations."),
            ("VIGILANCE", "Vigilance Cell", "Handles integrity investigations, corruption allegations and malpractices."),
            ("LEGAL", "Legal Affairs Bureau", "Coordinates judicial cases, court directives and legal compliance matters.")
        ]
        bureaus_map = {}
        for b_code, b_name, b_desc in bureaus_data:
            b = Bureau(code=b_code, name=b_name, description=b_desc, is_active=True)
            session.add(b)
            bureaus_map[b_code] = b
        session.flush()

        # 4. REGIONAL OFFICES
        print("4. Creating Regional Offices...")
        regions_data = [
            ("RO-NORTH", "Northern Regional Office", "New Delhi", "Delhi, Haryana, Punjab, Himachal Pradesh, Jammu & Kashmir"),
            ("RO-WEST", "Western Regional Office", "Mumbai", "Maharashtra, Gujarat, Goa"),
            ("RO-SOUTH", "Southern Regional Office", "Chennai", "Tamil Nadu, Kerala, Andhra Pradesh, Telangana"),
            ("RO-EAST", "Eastern Regional Office", "Kolkata", "West Bengal, Odisha, Bihar, Jharkhand, North-East States")
        ]
        regions_map = {}
        for r_code, r_name, r_state, r_juris in regions_data:
            ro = RegionalOffice(code=r_code, name=r_name, state=r_state, jurisdiction=r_juris, is_active=True)
            session.add(ro)
            regions_map[r_code] = ro
        session.flush()

        # 5. USERS (15 realistic enterprise users)
        print("5. Provisioning 15 Role-Based Users...")
        default_pwd = hash_password("Prism@2026!")

        users_spec = [
            ("superadmin@prism.gov.in", "Dr. Rajeshwar Sharma", "SUPER_ADMIN", None, None),
            ("centraladmin@prism.gov.in", "Sunita Narayanan", "CENTRAL_ADMIN", None, None),
            ("head.rb@prism.gov.in", "Virendra Singh (RB Head)", "BUREAU_HEAD", "RB", None),
            ("head.pgrc@prism.gov.in", "Anita Deshmukh (PGRC Head)", "BUREAU_HEAD", "PGRC", None),
            ("head.approval@prism.gov.in", "Dr. K. Ramanathan (Approval Head)", "BUREAU_HEAD", "APPROVAL", None),
            ("head.vigilance@prism.gov.in", "Col. Pradeep Bakshi (Vigilance Head)", "BUREAU_HEAD", "VIGILANCE", None),
            ("officer.rb1@prism.gov.in", "Manoj Tiwari (RB Officer)", "CASE_OFFICER", "RB", None),
            ("officer.rb2@prism.gov.in", "Pooja Verma (RB Officer)", "CASE_OFFICER", "RB", None),
            ("officer.pgrc1@prism.gov.in", "Amitabh Sen (PGRC Officer)", "CASE_OFFICER", "PGRC", None),
            ("officer.pgrc2@prism.gov.in", "Deepika Iyer (PGRC Officer)", "CASE_OFFICER", "PGRC", None),
            ("officer.appr@prism.gov.in", "Ramesh Chander (Approval Officer)", "CASE_OFFICER", "APPROVAL", None),
            ("ro.north@prism.gov.in", "Sanjay Aggarwal (RO North)", "REGIONAL_OFFICER", None, "RO-NORTH"),
            ("ro.west@prism.gov.in", "Meera Kulkarni (RO West)", "REGIONAL_OFFICER", None, "RO-WEST"),
            ("ro.south@prism.gov.in", "Gopinath Pillai (RO South)", "REGIONAL_OFFICER", None, "RO-SOUTH"),
            ("auditor@prism.gov.in", "Harishankar Trivedi (Auditor)", "AUDITOR", None, None),
        ]

        users_map = {}
        for email, name, r_name, b_code, ro_code in users_spec:
            u = User(
                email=email,
                hashed_password=default_pwd,
                full_name=name,
                role_id=roles_map[r_name].id,
                bureau_id=bureaus_map[b_code].id if b_code else None,
                regional_office_id=regions_map[ro_code].id if ro_code else None,
                is_active=True
            )
            session.add(u)
            users_map[email] = u
        session.flush()

        # 6. WORKFLOW & STAGES (Default 10 Stages)
        print("6. Configuring Default 10-Stage Workflow & Permitted Transitions...")
        workflow = WorkflowDefinition(
            name="Standard AICTE Regulatory Workflow",
            description="Official 10-stage grievance investigation and regulatory scrutiny lifecycle",
            is_default=True,
            is_active=True
        )
        session.add(workflow)
        session.flush()

        stages_data = [
            (1, "Received", "RECEIVED", True, False, False, 2, "slate"),
            (2, "Initial Scrutiny", "INITIAL_SCRUTINY", False, False, False, 3, "blue"),
            (3, "Under Review", "UNDER_REVIEW", False, False, False, 5, "amber"),
            (4, "Assigned for Investigation", "ASSIGNED_INVESTIGATION", False, False, False, 3, "indigo"),
            (5, "Investigation in Progress", "INVESTIGATION_PROGRESS", False, False, False, 14, "purple"),
            (6, "Awaiting Information", "AWAITING_INFO", False, False, False, 7, "orange"),
            (7, "Bureau Review", "BUREAU_REVIEW", False, False, False, 5, "cyan"),
            (8, "Awaiting Approval", "AWAITING_APPROVAL", False, False, True, 4, "rose"),
            (9, "Resolved", "RESOLVED", False, True, False, 2, "emerald"),
            (10, "Closed", "CLOSED", False, True, False, 0, "zinc"),
        ]
        stages_map = {}
        for order, s_name, code, is_init, is_fin, req_app, sla, color in stages_data:
            st = WorkflowStage(
                workflow_id=workflow.id,
                name=s_name,
                code=code,
                stage_order=order,
                is_initial=is_init,
                is_final=is_fin,
                requires_approval=req_app,
                sla_days=sla,
                color=color
            )
            session.add(st)
            stages_map[code] = st
        session.flush()

        # Permitted transitions
        transitions_spec = [
            ("RECEIVED", "INITIAL_SCRUTINY", ["SUPER_ADMIN", "CENTRAL_ADMIN", "BUREAU_HEAD", "CASE_OFFICER"], "Move to preliminary scrutiny"),
            ("INITIAL_SCRUTINY", "UNDER_REVIEW", ["SUPER_ADMIN", "CENTRAL_ADMIN", "BUREAU_HEAD", "CASE_OFFICER"], "Formal review initiated"),
            ("INITIAL_SCRUTINY", "ASSIGNED_INVESTIGATION", ["SUPER_ADMIN", "BUREAU_HEAD", "CENTRAL_ADMIN"], "Direct assignment for field or documentation inquiry"),
            ("UNDER_REVIEW", "ASSIGNED_INVESTIGATION", ["SUPER_ADMIN", "BUREAU_HEAD", "CENTRAL_ADMIN"], "Assign to investigating officer"),
            ("ASSIGNED_INVESTIGATION", "INVESTIGATION_PROGRESS", ["SUPER_ADMIN", "CASE_OFFICER", "REGIONAL_OFFICER"], "Officer initiates investigation steps"),
            ("INVESTIGATION_PROGRESS", "AWAITING_INFO", ["SUPER_ADMIN", "CASE_OFFICER", "REGIONAL_OFFICER"], "Show-cause or clarification query dispatched to institution"),
            ("AWAITING_INFO", "INVESTIGATION_PROGRESS", ["SUPER_ADMIN", "CASE_OFFICER", "REGIONAL_OFFICER"], "Response received from institution"),
            ("INVESTIGATION_PROGRESS", "BUREAU_REVIEW", ["SUPER_ADMIN", "CASE_OFFICER", "REGIONAL_OFFICER"], "Investigation report submitted for bureau review"),
            ("BUREAU_REVIEW", "AWAITING_APPROVAL", ["SUPER_ADMIN", "BUREAU_HEAD"], "Submitted to authority for final approval"),
            ("BUREAU_REVIEW", "INVESTIGATION_PROGRESS", ["SUPER_ADMIN", "BUREAU_HEAD"], "Sent back for supplementary inquiry"),
            ("AWAITING_APPROVAL", "RESOLVED", ["SUPER_ADMIN", "CENTRAL_ADMIN", "BUREAU_HEAD"], "Regulatory order approved and issued"),
            ("RESOLVED", "CLOSED", ["SUPER_ADMIN", "CENTRAL_ADMIN", "BUREAU_HEAD"], "Compliance verified and file archived"),
            ("INITIAL_SCRUTINY", "CLOSED", ["SUPER_ADMIN", "BUREAU_HEAD"], "Dismissed as frivolous or out of jurisdiction"),
        ]
        for from_code, to_code, roles_list, descr in transitions_spec:
            trans = WorkflowTransition(
                workflow_id=workflow.id,
                from_stage_id=stages_map[from_code].id,
                to_stage_id=stages_map[to_code].id,
                allowed_roles=roles_list,
                description=descr
            )
            session.add(trans)
        session.flush()

        # 7. COMPLAINT CATEGORIES
        print("7. Configuring Complaint Categories...")
        categories_data = [
            ("Approval-related issues", "APPROVAL_ISSUES", "Conducting unapproved courses, unauthorized intake expansion, non-compliance with sanction orders", 20),
            ("Infrastructure complaints", "INFRASTRUCTURE", "Deficient lab facilities, lack of library books, inadequate built-up area or fire safety non-compliance", 30),
            ("Faculty-related complaints", "FACULTY", "Faculty shortage, ghost faculty on payroll, non-payment of 7th CPC scale, unverified qualifications", 15),
            ("Academic compliance", "ACADEMIC", "Non-compliance with approved curriculum, mandatory attendance violations, non-accredited syllabus", 25),
            ("Examination-related complaints", "EXAMINATION", "Exam malpractice, irregular grade allocation, delayed result publishing", 15),
            ("Fee-related complaints", "FEE_ISSUES", "Charging capitation fee, withholding documents, refusal to refund admission cancellation deposit", 10),
            ("Institutional governance", "GOVERNANCE", "Non-constitution of Anti-Ragging committee, Internal Complaints Committee or Governing Council", 15),
            ("General grievances", "GENERAL", "Miscellaneous student or stakeholder grievances regarding campus facilities or services", 20),
        ]
        categories_map = {}
        for c_name, c_code, c_desc, sla in categories_data:
            cat = ComplaintCategory(name=c_name, code=c_code, description=c_desc, default_sla_days=sla, is_active=True)
            session.add(cat)
            categories_map[c_code] = cat
        session.flush()

        # 8. 50 SYNTHETIC INSTITUTIONS
        print("8. Seeding 50 Realistic Educational Institutions across India...")
        states_pool = [
            ("Delhi", ["New Delhi", "North Delhi", "South Delhi"]),
            ("Maharashtra", ["Mumbai", "Pune", "Nagpur", "Nashik"]),
            ("Karnataka", ["Bangalore", "Mysuru", "Hubli", "Mangalore"]),
            ("Tamil Nadu", ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"]),
            ("Uttar Pradesh", ["Lucknow", "Noida", "Kanpur", "Ghaziabad", "Varanasi"]),
            ("West Bengal", ["Kolkata", "Howrah", "Durgapur", "Siliguri"]),
            ("Telangana", ["Hyderabad", "Warangal", "Nizamabad"]),
            ("Gujarat", ["Ahmedabad", "Vadodara", "Surat", "Rajkot"]),
            ("Rajasthan", ["Jaipur", "Jodhpur", "Kota", "Udaipur"]),
            ("Kerala", ["Thiruvananthapuram", "Kochi", "Kozhikode"])
        ]
        types_pool = ["Technical Institute", "Engineering College", "Management Institute", "Polytechnic College", "Pharmacy College"]
        statuses_pool = ["Approved", "Approved", "Approved", "Under Scrutiny", "Deficient", "Suspended"]

        # Define prominent institutions including overlapping test targets
        institution_names = [
            ("Apex Institute of Technology & Engineering", "Delhi", "New Delhi", "Technical Institute"),
            ("Global Institute of Management Studies", "Maharashtra", "Pune", "Management Institute"),
            ("National College of Engineering and Technology", "Karnataka", "Bangalore", "Engineering College"),
            ("St. Jude Institute of Pharmaceutical Sciences", "Tamil Nadu", "Chennai", "Pharmacy College"),
            ("Kalinga Institute of Polytechnic and Technology", "West Bengal", "Kolkata", "Polytechnic College"),
            ("Vidyapeeth Institute of Engineering & Research", "Uttar Pradesh", "Noida", "Engineering College"),
            ("Deccan Academy of Management & Technology", "Telangana", "Hyderabad", "Management Institute"),
            ("Saraswati College of Engineering", "Maharashtra", "Mumbai", "Engineering College"),
            ("Marathwada Polytechnic College", "Maharashtra", "Nagpur", "Polytechnic College"),
            ("Surat Institute of Technology and Management", "Gujarat", "Surat", "Technical Institute"),
            ("Royal College of Pharmacy & Research", "Rajasthan", "Jaipur", "Pharmacy College"),
            ("Cochin Engineering Academy", "Kerala", "Kochi", "Engineering College"),
            ("Heritage Institute of Management", "Delhi", "South Delhi", "Management Institute"),
            ("Vanguard Technical Campus", "Karnataka", "Mysuru", "Technical Institute"),
            ("Bharathiar Institute of Technology", "Tamil Nadu", "Coimbatore", "Engineering College"),
            ("Ganga Institute of Professional Studies", "Uttar Pradesh", "Varanasi", "Technical Institute"),
            ("Pragati Polytechnic & Engineering College", "West Bengal", "Durgapur", "Polytechnic College"),
            ("Cyberabad Institute of Technology", "Telangana", "Hyderabad", "Engineering College"),
            ("Ahmedabad College of Engineering & Research", "Gujarat", "Ahmedabad", "Engineering College"),
            ("Thar Institute of Engineering", "Rajasthan", "Jodhpur", "Technical Institute"),
            ("Malabar College of Pharmacy", "Kerala", "Kozhikode", "Pharmacy College"),
            ("Indraprastha Academy of Science & Technology", "Delhi", "North Delhi", "Technical Institute"),
            ("Sahyadri Institute of Technology", "Maharashtra", "Nashik", "Engineering College"),
            ("Silicon Valley College of Management", "Karnataka", "Bangalore", "Management Institute"),
            ("Cauvery Polytechnic Institute", "Tamil Nadu", "Tiruchirappalli", "Polytechnic College"),
            ("Awadh Institute of Engineering & Technology", "Uttar Pradesh", "Lucknow", "Engineering College"),
            ("Durgapur Institute of Pharmaceutical Sciences", "West Bengal", "Durgapur", "Pharmacy College"),
            ("Kakatiya Institute of Technology", "Telangana", "Warangal", "Engineering College"),
            ("Baroda College of Management & Computer Applications", "Gujarat", "Vadodara", "Management Institute"),
            ("Aravalli Institute of Technology", "Rajasthan", "Kota", "Technical Institute"),
            ("Travancore Institute of Science & Technology", "Kerala", "Thiruvananthapuram", "Technical Institute"),
            ("Yamuna College of Engineering", "Delhi", "New Delhi", "Engineering College"),
            ("Vidarbha Institute of Technology", "Maharashtra", "Nagpur", "Technical Institute"),
            ("Hubli Technical Academy", "Karnataka", "Hubli", "Engineering College"),
            ("Pandiyan Institute of Management", "Tamil Nadu", "Madurai", "Management Institute"),
            ("Braj Institute of Technology", "Uttar Pradesh", "Kanpur", "Technical Institute"),
            ("Bengal Engineering Academy", "West Bengal", "Howrah", "Engineering College"),
            ("Telangana State Polytechnic College", "Telangana", "Nizamabad", "Polytechnic College"),
            ("Saurashtra Institute of Technology", "Gujarat", "Rajkot", "Technical Institute"),
            ("Mewar College of Engineering & Research", "Rajasthan", "Udaipur", "Engineering College"),
            ("Calicut Institute of Management Studies", "Kerala", "Kozhikode", "Management Institute"),
            ("Metro College of Technical Education", "Delhi", "South Delhi", "Technical Institute"),
            ("Konkan Institute of Pharmacy", "Maharashtra", "Mumbai", "Pharmacy College"),
            ("Coastal Karnataka Engineering College", "Karnataka", "Mangalore", "Engineering College"),
            ("Salem Institute of Technology", "Tamil Nadu", "Coimbatore", "Engineering College"),
            ("Rohilkhand Technical Institute", "Uttar Pradesh", "Ghaziabad", "Technical Institute"),
            ("Siliguri College of Polytechnic", "West Bengal", "Siliguri", "Polytechnic College"),
            ("Nizam Institute of Engineering", "Telangana", "Hyderabad", "Engineering College"),
            ("Gandhinagar Institute of Technology", "Gujarat", "Ahmedabad", "Engineering College"),
            ("Shekhawati Polytechnic Institute", "Rajasthan", "Jaipur", "Polytechnic College"),
        ]

        institutions_list = []
        for idx, (name, state, city, itype) in enumerate(institution_names, start=1):
            inst_id = str(uuid.uuid4())
            aicte_num = str(1000000000 + (idx * 13749) % 899999999)
            aicte_id = f"1-{aicte_num[:9]}"
            pincode = f"{random.randint(11, 79)}{random.randint(1000, 9999)}"
            appr_status = "Under Scrutiny" if idx in [1, 2, 3, 4] else random.choice(statuses_pool)

            inst = Institution(
                id=inst_id,
                aicte_id=aicte_id,
                name=name,
                normalized_name=normalize_text(name),
                institution_type=itype,
                address=f"Plot No. {random.randint(12, 450)}, Knowledge Park Sector {random.randint(1, 15)}, {city}",
                state=state,
                district=city,
                city=city,
                pincode=pincode,
                affiliated_university=f"State Technological University of {state}",
                approval_status=appr_status,
                approval_details=f"AICTE EoA sanctioned for academic cycles with intake capacity of {random.choice([300, 480, 600, 720])} students.",
                contact_email=f"registrar@{normalize_text(name).replace(' ', '')[:15]}.edu.in",
                contact_phone=f"+91-{random.randint(70, 98)}{random.randint(10000000, 99999999)}",
                website=f"https://www.{normalize_text(name).replace(' ', '')[:12]}.edu.in",
                is_active=True
            )
            session.add(inst)
            institutions_list.append(inst)

            # Identifiers
            ident = InstitutionIdentifier(
                institution_id=inst_id,
                identifier_type="AICTE_PERMANENT_ID",
                identifier_value=inst.aicte_id,
                is_verified=True,
                verified_at=now - timedelta(days=random.randint(100, 500))
            )
            session.add(ident)

            # Primary Contact
            contact = InstitutionContact(
                institution_id=inst_id,
                name=f"Prof. {random.choice(['S. K. Gupta', 'P. V. Rao', 'K. Sengupta', 'R. K. Sharma', 'M. N. Swamy'])}",
                designation="Principal / Director",
                email=inst.contact_email,
                phone=inst.contact_phone,
                is_primary=True
            )
            session.add(contact)

        session.flush()

        # 9. 150 COMPLAINTS (With intentionally overlapping clusters for AI evaluation)
        print("9. Generating 150 Realistic Complaints with Inter-Bureau Overlaps...")

        # Pre-assign targets for overlap clusters
        inst_apex = institutions_list[0]    # Apex Institute
        inst_global = institutions_list[1]  # Global Institute of Management
        inst_national = institutions_list[2]# National College of Engg
        inst_stjude = institutions_list[3]  # St. Jude Pharmacy

        complaints_list = []
        c_count = 1

        def build_case_id(num):
            return f"PRISM-2026-{str(num).zfill(6)}"

        # CLUSTER 1: Apex Institute (Unapproved courses allegations across bureaus)
        c1_1 = Complaint(
            case_id=build_case_id(c_count),
            subject="Running unapproved diploma and certification courses in Artificial Intelligence",
            description="The institution is advertising and admitting students into unapproved 2-year diploma programs in AI & ML without obtaining statutory sanction from AICTE.",
            normalized_description=normalize_text("The institution is advertising and admitting students into unapproved 2-year diploma programs in AI & ML without obtaining statutory sanction from AICTE."),
            institution_id=inst_apex.id,
            receiving_bureau_id=bureaus_map["RB"].id,
            regional_office_id=regions_map["RO-NORTH"].id,
            category_id=categories_map["APPROVAL_ISSUES"].id,
            subcategory="Unapproved Courses",
            severity="HIGH",
            priority="HIGH",
            current_stage_id=stages_map["INVESTIGATION_PROGRESS"].id,
            assigned_officer_id=users_map["officer.rb1@prism.gov.in"].id,
            complainant_name="Sunil Mehta",
            complainant_email="sunil.mehta@example.com",
            received_date=now - timedelta(days=28),
            due_date=now - timedelta(days=8), # OVERDUE!
            is_overdue=True,
            is_closed=False,
            created_by_id=users_map["officer.rb1@prism.gov.in"].id
        )
        c_count += 1
        complaints_list.append(c1_1)

        c1_2 = Complaint(
            case_id=build_case_id(c_count),
            subject="Offering unauthorized AI & Data Science programmes without AICTE sanction",
            description="Apex Inst of Technology is running unauthorized artificial intelligence diploma courses. Parents are misled regarding government approval.",
            normalized_description=normalize_text("Apex Inst of Technology is running unauthorized artificial intelligence diploma courses. Parents are misled regarding government approval."),
            institution_id=inst_apex.id,
            receiving_bureau_id=bureaus_map["PGRC"].id,
            regional_office_id=regions_map["RO-NORTH"].id,
            category_id=categories_map["APPROVAL_ISSUES"].id,
            subcategory="Unapproved Programmes",
            severity="HIGH",
            priority="HIGH",
            current_stage_id=stages_map["UNDER_REVIEW"].id,
            assigned_officer_id=users_map["officer.pgrc1@prism.gov.in"].id,
            complainant_name="Parents Association Delhi",
            complainant_email="parents.assoc@example.com",
            received_date=now - timedelta(days=14),
            due_date=now + timedelta(days=6),
            is_overdue=False,
            is_closed=False,
            created_by_id=users_map["officer.pgrc1@prism.gov.in"].id
        )
        c_count += 1
        complaints_list.append(c1_2)

        c1_3 = Complaint(
            case_id=build_case_id(c_count),
            subject="Misleading advertisements claiming full council approval for unapproved programs",
            description="Advertisements published in regional print media claim AICTE recognition for technical diplomas run by Apex Technology Institute, which are not approved in current EoA.",
            normalized_description=normalize_text("Advertisements published in regional print media claim AICTE recognition for technical diplomas run by Apex Technology Institute, which are not approved in current EoA."),
            institution_id=inst_apex.id,
            receiving_bureau_id=bureaus_map["APPROVAL"].id,
            regional_office_id=regions_map["RO-NORTH"].id,
            category_id=categories_map["APPROVAL_ISSUES"].id,
            subcategory="Misleading Advertisement",
            severity="MEDIUM",
            priority="MEDIUM",
            current_stage_id=stages_map["INITIAL_SCRUTINY"].id,
            assigned_officer_id=users_map["officer.appr@prism.gov.in"].id,
            complainant_name="RTI Activist Forum",
            complainant_email="activist.delhi@example.org",
            received_date=now - timedelta(days=7),
            due_date=now + timedelta(days=13),
            is_overdue=False,
            is_closed=False,
            created_by_id=users_map["officer.appr@prism.gov.in"].id
        )
        c_count += 1
        complaints_list.append(c1_3)

        # CLUSTER 2: Global Institute of Management (Capitation fee & refund refusal)
        c2_1 = Complaint(
            case_id=build_case_id(c_count),
            subject="Extortion of excess capitation fee and withholding original marksheets",
            description="The management demanded Rs 2,50,000 in unreceipted cash as capitation fee for MBA seat and refuses to return original 10th and 12th certificates when admission was withdrawn.",
            normalized_description=normalize_text("The management demanded Rs 2,50,000 in unreceipted cash as capitation fee for MBA seat and refuses to return original 10th and 12th certificates when admission was withdrawn."),
            institution_id=inst_global.id,
            receiving_bureau_id=bureaus_map["PGRC"].id,
            regional_office_id=regions_map["RO-WEST"].id,
            category_id=categories_map["FEE_ISSUES"].id,
            subcategory="Capitation Fee",
            severity="CRITICAL",
            priority="URGENT",
            current_stage_id=stages_map["BUREAU_REVIEW"].id,
            assigned_officer_id=users_map["officer.pgrc2@prism.gov.in"].id,
            complainant_name="Karan Malhotra",
            complainant_email="karan.m@example.com",
            received_date=now - timedelta(days=22),
            due_date=now - timedelta(days=12), # OVERDUE!
            is_overdue=True,
            is_closed=False,
            created_by_id=users_map["officer.pgrc2@prism.gov.in"].id
        )
        c_count += 1
        complaints_list.append(c2_1)

        c2_2 = Complaint(
            case_id=build_case_id(c_count),
            subject="Refusal to refund tuition fee and retention of original qualification documents",
            description="Global Management Institute Pune is unlawfully retaining original degree certificates and denying tuition fee refund despite timely cancellation before cut-off date.",
            normalized_description=normalize_text("Global Management Institute Pune is unlawfully retaining original degree certificates and denying tuition fee refund despite timely cancellation before cut-off date."),
            institution_id=inst_global.id,
            receiving_bureau_id=bureaus_map["RB"].id,
            regional_office_id=regions_map["RO-WEST"].id,
            category_id=categories_map["FEE_ISSUES"].id,
            subcategory="Fee Refund Denial",
            severity="HIGH",
            priority="HIGH",
            current_stage_id=stages_map["INVESTIGATION_PROGRESS"].id,
            assigned_officer_id=users_map["officer.rb2@prism.gov.in"].id,
            complainant_name="Shruti Patil",
            complainant_email="shruti.patil@example.com",
            received_date=now - timedelta(days=10),
            due_date=now + timedelta(days=5),
            is_overdue=False,
            is_closed=False,
            created_by_id=users_map["officer.rb2@prism.gov.in"].id
        )
        c_count += 1
        complaints_list.append(c2_2)

        # CLUSTER 3: National College of Engineering (Ghost faculty & deficient labs)
        c3_1 = Complaint(
            case_id=build_case_id(c_count),
            subject="Severe faculty deficiency and fraudulent ghost faculty listed on compliance portal",
            description="Over 40% of faculty members listed on mandatory disclosure do not attend college. Salaries are siphoned off using proxy biometric records in Computer Science and Mechanical departments.",
            normalized_description=normalize_text("Over 40% of faculty members listed on mandatory disclosure do not attend college. Salaries are siphoned off using proxy biometric records in Computer Science and Mechanical departments."),
            institution_id=inst_national.id,
            receiving_bureau_id=bureaus_map["VIGILANCE"].id,
            regional_office_id=regions_map["RO-SOUTH"].id,
            category_id=categories_map["FACULTY"].id,
            subcategory="Ghost Faculty",
            severity="CRITICAL",
            priority="URGENT",
            current_stage_id=stages_map["INVESTIGATION_PROGRESS"].id,
            assigned_officer_id=users_map["head.vigilance@prism.gov.in"].id,
            complainant_name="Anonymous Faculty Whistleblower",
            is_anonymous=True,
            received_date=now - timedelta(days=35),
            due_date=now - timedelta(days=20), # OVERDUE!
            is_overdue=True,
            is_closed=False,
            created_by_id=users_map["head.vigilance@prism.gov.in"].id
        )
        c_count += 1
        complaints_list.append(c3_1)

        c3_2 = Complaint(
            case_id=build_case_id(c_count),
            subject="Shortage of qualified teaching staff and fake teacher credentials in engineering streams",
            description="National College of Engineering Bangalore lacks full-time professors. Temporary guest lecturers are shown as regular PhD professors on inspection records.",
            normalized_description=normalize_text("National College of Engineering Bangalore lacks full-time professors. Temporary guest lecturers are shown as regular PhD professors on inspection records."),
            institution_id=inst_national.id,
            receiving_bureau_id=bureaus_map["RB"].id,
            regional_office_id=regions_map["RO-SOUTH"].id,
            category_id=categories_map["FACULTY"].id,
            subcategory="Faculty Cadre Ratio",
            severity="HIGH",
            priority="HIGH",
            current_stage_id=stages_map["AWAITING_INFO"].id,
            assigned_officer_id=users_map["officer.rb1@prism.gov.in"].id,
            complainant_name="Student Union Karnataka",
            complainant_email="students.ka@example.org",
            received_date=now - timedelta(days=18),
            due_date=now - timedelta(days=3), # OVERDUE!
            is_overdue=True,
            is_closed=False,
            created_by_id=users_map["officer.rb1@prism.gov.in"].id
        )
        c_count += 1
        complaints_list.append(c3_2)

        # Generate Remaining 143 Complaints across all institutions, bureaus, and stages
        stages_keys = list(stages_map.keys())
        officers_keys = [
            "officer.rb1@prism.gov.in", "officer.rb2@prism.gov.in",
            "officer.pgrc1@prism.gov.in", "officer.pgrc2@prism.gov.in",
            "officer.appr@prism.gov.in", "head.vigilance@prism.gov.in",
            "ro.north@prism.gov.in", "ro.west@prism.gov.in", "ro.south@prism.gov.in"
        ]
        bureau_keys = list(bureaus_map.keys())
        cat_keys = list(categories_map.keys())
        region_keys = list(regions_map.keys())

        complaint_subjects_pool = [
            ("Laboratory equipment non-functional during semester practicals", "INFRASTRUCTURE", "Deficient Equipment", "HIGH"),
            ("Non-payment of AICTE stipend to GATE qualified M.Tech scholars", "FEE_ISSUES", "Stipend Disbursal", "MEDIUM"),
            ("Ragging incident reported in campus hostel without disciplinary action", "GOVERNANCE", "Anti-Ragging", "CRITICAL"),
            ("Delayed issuance of semester grade transcripts and mark statements", "EXAMINATION", "Transcript Delay", "LOW"),
            ("Building safety certificate expired without renewal by local municipal body", "INFRASTRUCTURE", "Safety Norms", "HIGH"),
            ("Library has inadequate physical volumes and unfunctional e-journal access", "INFRASTRUCTURE", "Library Norms", "LOW"),
            ("Arbitrary collection of developmental fund and sports fees beyond approved fee structure", "FEE_ISSUES", "Excess Fee", "MEDIUM"),
            ("Internal complaints committee against sexual harassment not formed", "GOVERNANCE", "ICC Non-compliance", "CRITICAL"),
            ("Course curriculum outdated and not aligned with AICTE model curriculum", "ACADEMIC", "Syllabus Compliance", "LOW"),
            ("Examination papers evaluated arbitrarily without marking guidelines", "EXAMINATION", "Evaluation Bias", "MEDIUM"),
            ("Hostel mess food quality deficient leading to recurrent student illnesses", "GENERAL", "Campus Hygiene", "LOW"),
            ("Unqualified laboratory assistants conducting senior engineering experiments", "FACULTY", "Technical Staff Shortage", "MEDIUM"),
            ("Unauthorized shift in college campus address without prior Council permission", "APPROVAL_ISSUES", "Premises Relocation", "HIGH"),
            ("Attendance records manipulated to penalize students unfairly", "ACADEMIC", "Attendance Grievance", "LOW"),
            ("Non-refund of caution money deposits to graduated batch", "FEE_ISSUES", "Caution Money", "MEDIUM"),
        ]

        while c_count <= 150:
            target_inst = random.choice(institutions_list)
            subj_tpl = random.choice(complaint_subjects_pool)
            chosen_cat = categories_map[subj_tpl[1]]
            bureau_code = random.choice(bureau_keys)
            stage_code = random.choice(stages_keys)
            
            # Days calculation
            days_ago = random.randint(1, 90)
            received_dt = now - timedelta(days=days_ago)
            sla_days = chosen_cat.default_sla_days
            due_dt = received_dt + timedelta(days=sla_days)
            
            is_closed = stage_code in ["RESOLVED", "CLOSED"]
            is_overdue = (not is_closed) and (due_dt < now)
            closed_dt = (due_dt - timedelta(days=random.randint(1, 5))) if is_closed else None
            
            # Assignment
            assigned_off = random.choice(officers_keys) if stage_code != "RECEIVED" else None
            
            c = Complaint(
                case_id=build_case_id(c_count),
                subject=f"{subj_tpl[0]} at {target_inst.name[:35]}",
                description=f"Formal complaint submitted regarding {subj_tpl[2].lower()} at {target_inst.name}. Aggrieved parties request regulatory inspection and remedial directions.",
                normalized_description=normalize_text(f"{subj_tpl[0]} {target_inst.name} {subj_tpl[2]}"),
                institution_id=target_inst.id,
                receiving_bureau_id=bureaus_map[bureau_code].id,
                regional_office_id=random.choice(list(regions_map.values())).id,
                category_id=chosen_cat.id,
                subcategory=subj_tpl[2],
                severity=subj_tpl[3],
                priority=random.choice(["LOW", "MEDIUM", "HIGH", "URGENT"]),
                current_stage_id=stages_map[stage_code].id,
                assigned_officer_id=users_map[assigned_off].id if assigned_off else None,
                complainant_name=f"Complainant {c_count}",
                complainant_email=f"complainant{c_count}@example.org",
                complainant_phone=f"+91-98{random.randint(10000000, 99999999)}",
                is_anonymous=(c_count % 7 == 0),
                reference_number=f"EXT/REF/2026/{random.randint(1000, 9999)}" if c_count % 3 == 0 else None,
                received_date=received_dt,
                due_date=due_dt,
                is_overdue=is_overdue,
                is_closed=is_closed,
                resolution_summary="Inquiry finalized and regulatory directives issued." if is_closed else None,
                closed_at=closed_dt,
                created_by_id=users_map["centraladmin@prism.gov.in"].id
            )
            complaints_list.append(c)
            c_count += 1

        for comp in complaints_list:
            session.add(comp)
        session.flush()

        # 10. ATTACH COMMENTS, STATUS HISTORIES, & ASSIGNMENTS
        print("10. Attaching Status Histories, Officer Assignments and Investigation Notes...")
        for comp in complaints_list[:40]:
            # Initial history
            sh1 = ComplaintStatusHistory(
                complaint_id=comp.id,
                from_stage_id=None,
                to_stage_id=stages_map["RECEIVED"].id,
                changed_by_id=users_map["centraladmin@prism.gov.in"].id,
                remarks="Grievance logged via Central Integrated Intake Portal.",
                created_at=comp.received_date
            )
            session.add(sh1)
            
            # Progress history if not in RECEIVED
            if comp.current_stage_id != stages_map["RECEIVED"].id:
                sh2 = ComplaintStatusHistory(
                    complaint_id=comp.id,
                    from_stage_id=stages_map["RECEIVED"].id,
                    to_stage_id=comp.current_stage_id,
                    changed_by_id=comp.assigned_officer_id or users_map["head.rb@prism.gov.in"].id,
                    remarks="Matter scrutinized and transitioned to active workflow stage.",
                    created_at=comp.received_date + timedelta(days=2)
                )
                session.add(sh2)

            # Assignment record
            if comp.assigned_officer_id:
                asgn = ComplaintAssignment(
                    complaint_id=comp.id,
                    assigned_to_id=comp.assigned_officer_id,
                    assigned_by_id=users_map["head.rb@prism.gov.in"].id,
                    assignment_reason="Assigned based on bureau jurisdiction and category specialization.",
                    assigned_at=comp.received_date + timedelta(days=1)
                )
                session.add(asgn)

            # Investigation notes
            comment = ComplaintComment(
                complaint_id=comp.id,
                user_id=comp.assigned_officer_id or users_map["officer.rb1@prism.gov.in"].id,
                comment_text="Preliminary inquiry initiated. Notice sent to institute administration seeking authenticated explanation and documentary evidence.",
                is_internal=True,
                created_at=comp.received_date + timedelta(days=3)
            )
            session.add(comment)

        session.flush()

        # 11. AI MATCH GENERATION FOR OVERLAPPING CASES
        print("11. Pre-generating AI Match Results and Confirmed Relationships...")
        # Pair C1_1 and C1_2 (Apex unapproved courses)
        dict_c1_1 = {"id": c1_1.id, "case_id": c1_1.case_id, "institution_id": c1_1.institution_id, "institution_name": inst_apex.name, "aicte_id": inst_apex.aicte_id, "subject": c1_1.subject, "description": c1_1.description, "category_id": c1_1.category_id, "subcategory": c1_1.subcategory, "bureau_code": "RB"}
        dict_c1_2 = {"id": c1_2.id, "case_id": c1_2.case_id, "institution_id": c1_2.institution_id, "institution_name": inst_apex.name, "aicte_id": inst_apex.aicte_id, "subject": c1_2.subject, "description": c1_2.description, "category_id": c1_2.category_id, "subcategory": c1_2.subcategory, "bureau_code": "PGRC"}
        eval_c1 = matching_engine.evaluate_pair(dict_c1_1, dict_c1_2)

        match_apex = AIMatchResult(
            source_complaint_id=c1_1.id,
            target_complaint_id=c1_2.id,
            overall_score=eval_c1["overall_score"],
            institution_score=eval_c1["institution_score"],
            semantic_score=eval_c1["semantic_score"],
            category_score=eval_c1["category_score"],
            context_score=eval_c1["context_score"],
            classification=eval_c1["classification"],
            explanation_json=eval_c1,
            status="CONFIRMED"
        )
        session.add(match_apex)
        session.flush()

        # Create verified ComplaintRelationship for Apex
        rel_apex = ComplaintRelationship(
            source_complaint_id=c1_1.id,
            target_complaint_id=c1_2.id,
            relationship_type="UNAPPROVED_COURSES_CLUSTER",
            confidence_score=eval_c1["overall_score"],
            explanation=eval_c1["summary_explanation"],
            verification_status="CONFIRMED",
            verified_by_id=users_map["head.rb@prism.gov.in"].id,
            verification_notes="Verified by Bureau Head: Both cases relate to unapproved AI & Data Science diploma courses run by Apex Institute.",
            verified_at=now - timedelta(days=5)
        )
        session.add(rel_apex)

        # Pair C2_1 and C2_2 (Global Institute Capitation Fee)
        dict_c2_1 = {"id": c2_1.id, "case_id": c2_1.case_id, "institution_id": c2_1.institution_id, "institution_name": inst_global.name, "aicte_id": inst_global.aicte_id, "subject": c2_1.subject, "description": c2_1.description, "category_id": c2_1.category_id, "subcategory": c2_1.subcategory, "bureau_code": "PGRC"}
        dict_c2_2 = {"id": c2_2.id, "case_id": c2_2.case_id, "institution_id": c2_2.institution_id, "institution_name": inst_global.name, "aicte_id": inst_global.aicte_id, "subject": c2_2.subject, "description": c2_2.description, "category_id": c2_2.category_id, "subcategory": c2_2.subcategory, "bureau_code": "RB"}
        eval_c2 = matching_engine.evaluate_pair(dict_c2_1, dict_c2_2)

        match_global = AIMatchResult(
            source_complaint_id=c2_1.id,
            target_complaint_id=c2_2.id,
            overall_score=eval_c2["overall_score"],
            institution_score=eval_c2["institution_score"],
            semantic_score=eval_c2["semantic_score"],
            category_score=eval_c2["category_score"],
            context_score=eval_c2["context_score"],
            classification=eval_c2["classification"],
            explanation_json=eval_c2,
            status="UNREVIEWED" # Left for officer to test in AI workspace!
        )
        session.add(match_global)

        # Pair C3_1 and C3_2 (National College ghost faculty)
        dict_c3_1 = {"id": c3_1.id, "case_id": c3_1.case_id, "institution_id": c3_1.institution_id, "institution_name": inst_national.name, "aicte_id": inst_national.aicte_id, "subject": c3_1.subject, "description": c3_1.description, "category_id": c3_1.category_id, "subcategory": c3_1.subcategory, "bureau_code": "VIGILANCE"}
        dict_c3_2 = {"id": c3_2.id, "case_id": c3_2.case_id, "institution_id": c3_2.institution_id, "institution_name": inst_national.name, "aicte_id": inst_national.aicte_id, "subject": c3_2.subject, "description": c3_2.description, "category_id": c3_2.category_id, "subcategory": c3_2.subcategory, "bureau_code": "RB"}
        eval_c3 = matching_engine.evaluate_pair(dict_c3_1, dict_c3_2)

        match_national = AIMatchResult(
            source_complaint_id=c3_1.id,
            target_complaint_id=c3_2.id,
            overall_score=eval_c3["overall_score"],
            institution_score=eval_c3["institution_score"],
            semantic_score=eval_c3["semantic_score"],
            category_score=eval_c3["category_score"],
            context_score=eval_c3["context_score"],
            classification=eval_c3["classification"],
            explanation_json=eval_c3,
            status="UNREVIEWED"
        )
        session.add(match_national)

        # 12. RELATED CASE GROUPS
        print("12. Creating Related Case Groups...")
        grp = RelatedCaseGroup(
            group_code="GRP-2026-0001",
            institution_id=inst_apex.id,
            common_issue_description="Multiple cross-bureau complaints regarding unapproved AI diploma courses conducted without Council sanction.",
            verification_status="CONFIRMED",
            created_by_id=users_map["head.rb@prism.gov.in"].id
        )
        session.add(grp)
        session.flush()

        mem1 = RelatedCaseGroupMember(group_id=grp.id, complaint_id=c1_1.id, added_by_id=users_map["head.rb@prism.gov.in"].id)
        mem2 = RelatedCaseGroupMember(group_id=grp.id, complaint_id=c1_2.id, added_by_id=users_map["head.rb@prism.gov.in"].id)
        session.add(mem1)
        session.add(mem2)

        # 13. CROSS-BUREAU COORDINATION REQUESTS
        print("13. Creating Inter-Bureau Coordination Requests...")
        coord = CoordinationRequest(
            source_complaint_id=c1_1.id,
            target_complaint_id=c1_2.id,
            requesting_bureau_id=bureaus_map["RB"].id,
            target_bureau_id=bureaus_map["PGRC"].id,
            requested_by_id=users_map["officer.rb1@prism.gov.in"].id,
            title="Joint Scrutiny Request for Apex Institute Unapproved AI Program",
            request_details="Regulation Bureau has received physical inspection reports indicating unapproved admissions. Requesting PGRC to share all complainant submissions received by your cell for consolidated hearing.",
            status="ACCEPTED",
            deadline=now + timedelta(days=7),
            resolution_summary="PGRC agreed to share complainant representations and participate in joint hearing."
        )
        session.add(coord)
        session.flush()

        msg1 = CoordinationMessage(
            coordination_request_id=coord.id,
            sender_id=users_map["officer.rb1@prism.gov.in"].id,
            bureau_id=bureaus_map["RB"].id,
            message="Requesting all documentary evidence furnished by complainants regarding fees paid for unapproved AI diploma."
        )
        msg2 = CoordinationMessage(
            coordination_request_id=coord.id,
            sender_id=users_map["officer.pgrc1@prism.gov.in"].id,
            bureau_id=bureaus_map["PGRC"].id,
            message="Acknowledged. We have 3 receipts and student affidavits. Uploading to shared case repository."
        )
        session.add(msg1)
        session.add(msg2)

        # 14. EVIDENCE FILES
        print("14. Attaching Synthetic Evidence Records...")
        os.makedirs("./storage/uploads", exist_ok=True)
        dummy_content = b"%PDF-1.4 Official Synthetic Regulatory Inquiry Document for Testing PRISM Platform."
        dummy_hash = compute_sha256_file(dummy_content)
        file_path = os.path.join("./storage/uploads", "sample_inspection_report.pdf")
        with open(file_path, "wb") as f:
            f.write(dummy_content)

        ev1 = ComplaintEvidence(
            complaint_id=c1_1.id,
            institution_id=inst_apex.id,
            file_name="sample_inspection_report.pdf",
            original_file_name="Apex_Surprise_Inspection_Report_2026.pdf",
            file_path=file_path,
            file_size_bytes=len(dummy_content),
            mime_type="application/pdf",
            sha256_hash=dummy_hash,
            document_category="INVESTIGATION_REPORT",
            uploaded_by_id=users_map["officer.rb1@prism.gov.in"].id,
            is_verified=True
        )
        session.add(ev1)

        # 15. NOTIFICATIONS
        print("15. Creating Sample In-App Notifications...")
        notif_list = [
            ("Case PRISM-2026-000001 Overdue", "Case PRISM-2026-000001 (Apex Institute) is overdue by 8 days.", "OVERDUE_WARNING", c1_1.id, "COMPLAINT", users_map["officer.rb1@prism.gov.in"].id),
            ("High AI Overlap Detected", "AI engine identified 89.2% similarity between Case PRISM-2026-000004 and Case PRISM-2026-000005.", "AI_MATCH_DETECTED", match_global.id, "AI_MATCH", users_map["head.pgrc@prism.gov.in"].id),
            ("New Cross-Bureau Coordination Request", "Regulation Bureau requested coordination on Apex Institute complaint.", "COORDINATION_REQ", coord.id, "COORDINATION", users_map["officer.pgrc1@prism.gov.in"].id),
        ]
        for title, msg, n_type, ref_id, ref_type, u_id in notif_list:
            notif = Notification(
                user_id=u_id,
                title=title,
                message=msg,
                notification_type=n_type,
                reference_id=ref_id,
                reference_type=ref_type,
                is_read=False
            )
            session.add(notif)

        # 16. AUDIT LOGS
        print("16. Logging Audit Events...")
        audit_events = [
            ("AUTH_LOGIN_SUCCESS", "USER", users_map["superadmin@prism.gov.in"].id, "superadmin@prism.gov.in", "SUPER_ADMIN", {"login_ip": "127.0.0.1"}),
            ("CREATE_INSTITUTION", "INSTITUTION", inst_apex.id, "centraladmin@prism.gov.in", "CENTRAL_ADMIN", {"aicte_id": inst_apex.aicte_id, "name": inst_apex.name}),
            ("CREATE_COMPLAINT", "COMPLAINT", c1_1.id, "officer.rb1@prism.gov.in", "CASE_OFFICER", {"case_id": c1_1.case_id, "severity": c1_1.severity}),
            ("ASSIGN_OFFICER", "COMPLAINT", c1_1.id, "head.rb@prism.gov.in", "BUREAU_HEAD", {"assigned_to": "officer.rb1@prism.gov.in"}),
            ("AI_MATCH_CONFIRMED", "AI_MATCH", match_apex.id, "head.rb@prism.gov.in", "BUREAU_HEAD", {"source_case": c1_1.case_id, "target_case": c1_2.case_id, "score": eval_c1["overall_score"]}),
            ("CREATE_COORDINATION_REQUEST", "COORDINATION_REQUEST", coord.id, "officer.rb1@prism.gov.in", "CASE_OFFICER", {"target_bureau": "PGRC"}),
            ("UPLOAD_EVIDENCE", "EVIDENCE", ev1.id, "officer.rb1@prism.gov.in", "CASE_OFFICER", {"file_name": ev1.original_file_name, "sha256": ev1.sha256_hash}),
        ]
        for action, res_type, res_id, u_email, u_role, details in audit_events:
            audit = AuditLog(
                user_email=u_email,
                user_role=u_role,
                action=action,
                resource_type=res_type,
                resource_id=res_id,
                change_details_json=details,
                ip_address="127.0.0.1",
                correlation_id=str(uuid.uuid4())
            )
            session.add(audit)

        # 17. SYSTEM SETTINGS
        print("17. Initializing Enterprise System Settings...")
        settings_spec = [
            ("ai_matching_weights", {"institution": 0.40, "semantic": 0.35, "category": 0.15, "context": 0.10}, "Scoring weights for AI similarity calculation engine"),
            ("ai_similarity_thresholds", {"high": 0.75, "medium": 0.45}, "Classification thresholds for High/Medium similarity match detection"),
            ("sla_escalation_rules", {"level1_days": 3, "level2_supervisor_days": 3, "level3_bureau_head_days": 7}, "Configurable SLA breach escalation intervals in days"),
            ("system_banner", {"enabled": True, "text": "PRISM Central Coordination Platform - Official Regulatory Operations Environment", "type": "info"}, "Top notification banner displayed to authenticated users"),
        ]
        for key, val, descr in settings_spec:
            sett = SystemSetting(setting_key=key, setting_value=val, description=descr)
            session.add(sett)

        session.commit()
        print("\n=======================================================")
        print("PRISM Enterprise Seeding Completed Successfully!")
        print(f"- 50 Educational Institutions created")
        print(f"- 5 Bureaus & 4 Regional Offices created")
        print(f"- 15 User Accounts provisioned (password: Prism@2026!)")
        print(f"- 150 Complaints registered with PRISM-2026-XXXXXX IDs")
        print(f"- AI Overlap Results, Groups, Coordination, and Audit Logs seeded")
        print("=======================================================\n")

    except Exception as e:
        session.rollback()
        print(f"Error during seeding: {e}")
        raise
    finally:
        session.close()

if __name__ == "__main__":
    seed_database()
