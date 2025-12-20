from flowsint_core.core.postgre_db import SessionLocal
from flowsint_core.core.models import Profile
from flowsint_core.core.auth import get_password_hash
from datetime import datetime, timezone

def create_admin_user():
    db = SessionLocal()
    try:
        email = "lucas.oliveira@scarletredsolutions.com"
        password = "@Lcw25257946"
        
        # Check if user exists
        user = db.query(Profile).filter(Profile.email == email).first()
        
        if user:
            print(f"User {email} already exists. Updating password...")
            user.hashed_password = get_password_hash(password)
            user.is_active = True
            user.is_superuser = True
            user.is_paid = True
        else:
            print(f"Creating user {email}...")
            user = Profile(
                email=email,
                hashed_password=get_password_hash(password),
                full_name="Lucas Oliveira",
                is_active=True,
                is_superuser=True,
                is_paid=True,
                created_at=datetime.now(timezone.utc)
            )
            db.add(user)
        
        db.commit()
        print("Admin user created/updated successfully.")
        
    except Exception as e:
        print(f"Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
