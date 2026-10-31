import os
import sys
import json
from datetime import datetime
from dateutil import parser as dt_parser

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine, select, text
from sqlalchemy.orm import sessionmaker, make_transient
from backend.app.core.database import Base
from backend.app.models import (
    User, Role, Permission, RolePermission, Bureau, RegionalOffice,
    Institution, InstitutionIdentifier, InstitutionContact,
    Complaint, ComplaintCategory, ComplaintAssignment, ComplaintStatusHistory,
    ComplaintComment, ComplaintRelationship, RelatedCaseGroup, RelatedCaseGroupMember,
    AIMatchResult, AIMatchReview, WorkflowDefinition, WorkflowStage, WorkflowTransition,
    CoordinationRequest, CoordinationMessage, ComplaintEvidence, Notification,
    EscalationPolicy, EscalationEvent, AuditLog, SystemSetting
)

NEON_SYNC_URL = "postgresql+psycopg2://neondb_owner:npg_fn7WStxjTD4r@ep-cold-grass-azw94iky-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
SQLITE_SYNC_URL = "sqlite:///prism.db"

# Model list in dependency order
MODELS_IN_ORDER = [
    Bureau,
    ComplaintCategory,
    Institution,
    Permission,
    RegionalOffice,
    Role,
    WorkflowDefinition,
    EscalationPolicy,
    InstitutionContact,
    InstitutionIdentifier,
    RolePermission,
    User,
    WorkflowStage,
    AuditLog,
    Complaint,
    Notification,
    RelatedCaseGroup,
    SystemSetting,
    WorkflowTransition,
    AIMatchResult,
    ComplaintAssignment,
    ComplaintComment,
    ComplaintEvidence,
    ComplaintRelationship,
    ComplaintStatusHistory,
    CoordinationRequest,
    EscalationEvent,
    RelatedCaseGroupMember,
    AIMatchReview,
    CoordinationMessage,
]

def migrate():
    print("--- 1. Connecting to Neon PostgreSQL ---")
    neon_engine = create_engine(NEON_SYNC_URL, echo=False)
    sqlite_engine = create_engine(SQLITE_SYNC_URL, echo=False)

    print("--- 2. Creating Tables in Neon PostgreSQL ---")
    Base.metadata.create_all(bind=neon_engine)
    print("All tables created successfully in Neon!")

    NeonSession = sessionmaker(bind=neon_engine)
    SqliteSession = sessionmaker(bind=sqlite_engine)

    neon_session = NeonSession()
    sqlite_session = SqliteSession()

    try:
        print("--- 3. Migrating Data from SQLite to Neon PostgreSQL ---")
        for model in MODELS_IN_ORDER:
            table_name = model.__tablename__
            
            # Check if Neon already has rows
            existing_count = neon_session.query(model).count()
            sqlite_count = sqlite_session.query(model).count()

            print(f"[{table_name}] SQLite count: {sqlite_count}, Existing Neon count: {existing_count}")

            if sqlite_count == 0:
                continue

            if existing_count > 0:
                print(f"  -> Skipping {table_name} as it already contains data in Neon.")
                continue

            # Query all records from SQLite
            records = sqlite_session.query(model).all()
            for record in records:
                sqlite_session.expunge(record)
                make_transient(record)
                neon_session.add(record)

            neon_session.commit()
            print(f"  -> Migrated {len(records)} rows into {table_name}")

        print("\n--- 4. Verification of Table Row Counts ---")
        all_passed = True
        for model in MODELS_IN_ORDER:
            table_name = model.__tablename__
            s_count = sqlite_session.query(model).count()
            n_count = neon_session.query(model).count()
            status = "MATCH" if s_count == n_count else "MISMATCH"
            if status == "MISMATCH":
                all_passed = False
            print(f"  {table_name.ljust(30)}: SQLite={s_count} | Neon={n_count} [{status}]")

        if all_passed:
            print("\nMigration Completed Successfully! All table counts match 100%.")
        else:
            print("\nWarning: Some table counts did not match.")

    except Exception as e:
        neon_session.rollback()
        print(f"Error during migration: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        neon_session.close()
        sqlite_session.close()

if __name__ == "__main__":
    migrate()
