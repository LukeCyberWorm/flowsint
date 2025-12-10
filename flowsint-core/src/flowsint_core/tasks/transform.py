import os
import uuid
import asyncio
from dotenv import load_dotenv
from typing import List, Optional
from celery import states
from flowsint_core.core.registry import TransformRegistry
from ..core.celery import celery
from ..core.postgre_db import SessionLocal, get_db
from ..core.graph_db import Neo4jConnection
from ..core.vault import Vault
from ..core.models import Scan
from sqlalchemy.orm import Session
from ..core.logger import Logger
from ..core.enums import EventLevel
from flowsint_core.utils import to_json_serializable

load_dotenv()

URI = os.getenv("NEO4J_URI_BOLT")
USERNAME = os.getenv("NEO4J_USERNAME")
PASSWORD = os.getenv("NEO4J_PASSWORD")

neo4j_connection = Neo4jConnection(URI, USERNAME, PASSWORD)
db: Session = next(get_db())


@celery.task(name="run_transform", bind=True)
def run_transform(
    self,
    transform_name: str,
    serialized_objects: List[dict],
    sketch_id: str | None,
    owner_id: Optional[str] = None,
):
    session = SessionLocal()

    try:
        print(f"[TRANSFORM DEBUG] Transform: {transform_name}")
        print(f"[TRANSFORM DEBUG] Serialized objects: {serialized_objects}")
        print(f"[TRANSFORM DEBUG] Sketch ID: {sketch_id}")
        print(f"[TRANSFORM DEBUG] Owner ID: {owner_id}")

        scan_id = uuid.UUID(self.request.id)

        scan = Scan(
            id=scan_id,
            status=EventLevel.PENDING,
            sketch_id=uuid.UUID(sketch_id) if sketch_id else None,
        )
        session.add(scan)
        session.commit()

        # Create vault instance if owner_id is provided
        vault = None
        if owner_id:
            try:
                vault = Vault(session, uuid.UUID(owner_id))
            except Exception as e:
                Logger.error(
                    sketch_id, {"message": f"Failed to create vault: {str(e)}"}
                )

        if not TransformRegistry.transform_exists(transform_name):
            raise ValueError(f"Transform '{transform_name}' not found in registry")

        transform = TransformRegistry.get_transform(
            name=transform_name,
            sketch_id=sketch_id,
            scan_id=scan_id,
            neo4j_conn=neo4j_connection,
            vault=vault,
        )

        print(f"[TRANSFORM DEBUG] Transform instance created: {transform}")
        print(f"[TRANSFORM DEBUG] About to execute with values: {serialized_objects}")

        # Deserialize objects back into Pydantic models
        # The preprocess method in Transform will handle these already-parsed objects
        results = asyncio.run(transform.execute(values=serialized_objects))

        print(f"[TRANSFORM DEBUG] Execution completed. Results: {results}")
        print(f"[TRANSFORM DEBUG] Results type: {type(results)}")
        print(f"[TRANSFORM DEBUG] Results length: {len(results) if results else 0}")

        # Check if results are empty and log warning
        if not results or (isinstance(results, list) and len(results) == 0):
            warning_msg = f"Transform '{transform_name}' completed but returned no results."
            if len(serialized_objects) > 0:
                warning_msg += f" Input had {len(serialized_objects)} items but produced 0 outputs."
                warning_msg += " This may indicate: 1) Missing API keys in Vault, 2) External API unavailable, 3) No data found for the input."
            
            Logger.warn(sketch_id, {"message": warning_msg})
            print(f"[TRANSFORM WARNING] {warning_msg}")

        scan.status = EventLevel.COMPLETED
        scan.results = to_json_serializable(results)
        session.commit()

        print(f"[TRANSFORM DEBUG] Final scan results: {scan.results}")

        return {"result": scan.results}

    except Exception as ex:
        session.rollback()
        error_logs = f"An error occurred: {str(ex)}"
        print(f"Error in task: {error_logs}")

        scan = session.query(Scan).filter(Scan.id == uuid.UUID(self.request.id)).first()
        if scan:
            scan.status = EventLevel.FAILED
            scan.results = {"error": error_logs}
            session.commit()

        self.update_state(state=states.FAILURE)
        raise ex

    finally:
        session.close()
