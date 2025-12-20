import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the parent directory to sys.path to allow importing from flowsint_core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from flowsint_core.core.models import Profile
    from flowsint_core.core.auth import get_password_hash
except ImportError:
    # Fallback if flowsint_core is not installed as a package
    # Try to find where it is. Assuming we are in flowsint-api/
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from flowsint_core.core.models import Profile
    from flowsint_core.core.auth import get_password_hash

# Connection string
# Inside the container, we should use the environment variables or the service name
postgres_server = os.getenv("POSTGRES_SERVER", "postgres")
postgres_user = os.getenv("POSTGRES_USER", "flowsint")
postgres_password = os.getenv("POSTGRES_PASSWORD", "flowsint")
postgres_db = os.getenv("POSTGRES_DB", "flowsint")
postgres_port = os.getenv("POSTGRES_PORT", "5432")

DATABASE_URL = f"postgresql://{postgres_user}:{postgres_password}@{postgres_server}:{postgres_port}/{postgres_db}"

print(f"Using database: {DATABASE_URL}")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_admin():
    print("Connecting to database...")
    try:
        db = SessionLocal()
        # Test connection
        db.execute(text("SELECT 1"))
        print("Connected.")
    except Exception as e:
        print(f"Failed to connect: {e}")
        return

    email = "lucas.oliveira@scarletredsolutions.com"
    password = "@Lcw25257946"
    
    print(f"Checking user {email}...")
    user = db.query(Profile).filter(Profile.email == email).first()
    
    if user:
        print(f"User {email} already exists. Updating password.")
        user.hashed_password = get_password_hash(password)
        user.is_paid = True
    else:
        print(f"Creating user {email}.")
        user = Profile(
            email=email,
            hashed_password=get_password_hash(password),
            is_paid=True
        )
        db.add(user)
    
    try:
        db.commit()
        print("Success! Admin user configured.")
    except Exception as e:
        print(f"Error saving user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
