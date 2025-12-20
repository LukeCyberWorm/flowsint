import uuid
from flowsint_core.core.postgre_db import SessionLocal
from app.models.dossier import Dossier, DossierStatus

def create_specific_dossier():
    db = SessionLocal()
    try:
        # Check if exists
        token = "SRS-CASO12112025-2025"
        existing = db.query(Dossier).filter(Dossier.access_token == token).first()
        if existing:
            print(f"Dossier already exists: {existing.id}")
            return

        dossier = Dossier(
            id=uuid.uuid4(),
            case_number="SRS-CASO12112025",
            title="Investigação Corporativa - Caso 12112025",
            description="Dossiê completo da investigação solicitada.",
            status=DossierStatus.ACTIVE.value,
            client_name="Cliente Confidencial",
            is_public=True,
            access_token=token,
            created_by=None # System created
        )
        db.add(dossier)
        db.commit()
        print(f"Created dossier: {dossier.id} with token '{token}'")
    except Exception as e:
        print(f"Error creating dossier: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_specific_dossier()
