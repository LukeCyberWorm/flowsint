import uuid
from flowsint_core.core.postgre_db import SessionLocal
from app.models.dossier import Dossier, DossierStatus

def create_test_dossier():
    db = SessionLocal()
    try:
        # Check if exists
        existing = db.query(Dossier).filter(Dossier.case_number == "TEST-001").first()
        if existing:
            print(f"Test dossier already exists: {existing.id}")
            return

        dossier = Dossier(
            id=uuid.uuid4(),
            case_number="TEST-001",
            title="Caso Teste - Fraude Corporativa",
            description="Investigação de desvio de fundos na empresa X.",
            status=DossierStatus.ACTIVE.value,
            client_name="Empresa X Ltda",
            is_public=True,
            access_token="teste123",
            created_by=None # System created
        )
        db.add(dossier)
        db.commit()
        print(f"Created test dossier: {dossier.id} with token 'teste123'")
    except Exception as e:
        print(f"Error creating dossier: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_test_dossier()
