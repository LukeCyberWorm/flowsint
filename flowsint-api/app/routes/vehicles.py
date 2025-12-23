"""
FastAPI routes for Vehicle Entity
Endpoints para gerenciamento de veículos
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from flowsint_core.core.postgre_db import get_db
from app.models.vehicle import Vehicle, VehicleRadarDetection
from app.schemas.vehicle import (
    VehicleCreate,
    VehicleUpdate,
    VehicleResponse,
    VehicleWithDetections,
    VehicleListResponse,
    VehicleSearchByPlate,
    VehicleSearchByOwner,
    VehicleSearchByDriver,
    VehicleSearchByRadar,
    RadarDetectionCreate,
    RadarDetectionResponse,
    RadarDetectionListResponse,
)
from app.integrations.workconsultoria.client import work_client


router = APIRouter(prefix="/vehicles", tags=["vehicles"])


# ===== CRUD BÁSICO =====

@router.post("/", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db)
):
    """
    Cria um novo veículo no sistema
    """
    db_vehicle = Vehicle(**vehicle.dict())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@router.get("/{vehicle_id}", response_model=VehicleWithDetections)
async def get_vehicle(
    vehicle_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Busca veículo por ID com histórico de detecções
    """
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    return vehicle


@router.get("/", response_model=VehicleListResponse)
async def list_vehicles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    dossier_id: Optional[UUID] = None,
    investigation_id: Optional[UUID] = None,
    db: Session = Depends(get_db)
):
    """
    Lista veículos com paginação e filtros
    """
    query = db.query(Vehicle)
    
    if dossier_id:
        query = query.filter(Vehicle.dossier_id == dossier_id)
    if investigation_id:
        query = query.filter(Vehicle.investigation_id == investigation_id)
    
    total = query.count()
    vehicles = query.offset(skip).limit(limit).all()
    
    return {"total": total, "items": vehicles}


@router.put("/{vehicle_id}", response_model=VehicleResponse)
async def update_vehicle(
    vehicle_id: UUID,
    vehicle_update: VehicleUpdate,
    db: Session = Depends(get_db)
):
    """
    Atualiza dados de um veículo
    """
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    # Atualizar campos
    for field, value in vehicle_update.dict(exclude_unset=True).items():
        setattr(db_vehicle, field, value)
    
    db_vehicle.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(
    vehicle_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Remove um veículo do sistema
    """
    db_vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    db.delete(db_vehicle)
    db.commit()
    return None


# ===== BUSCA POR PLACA =====

@router.post("/search/plate", response_model=VehicleWithDetections)
async def search_vehicle_by_plate(
    search: VehicleSearchByPlate,
    save_to_db: bool = Query(True, description="Salvar resultado no banco"),
    dossier_id: Optional[UUID] = Query(None, description="ID do dossiê para associar"),
    db: Session = Depends(get_db)
):
    """
    Busca veículo por placa na API Work Consultoria
    
    1. Busca na Work API
    2. Salva no banco (opcional)
    3. Retorna dados do veículo
    """
    # Verificar se já existe no banco
    existing = db.query(Vehicle).filter(Vehicle.plate == search.plate).first()
    if existing and not save_to_db:
        return existing
    
    try:
        # Buscar na Work API (quando endpoint estiver disponível)
        # Por enquanto, retorna erro informativo
        raise HTTPException(
            status_code=501,
            detail={
                "message": "Endpoint de busca por placa ainda não disponível na API Work Consultoria",
                "alternative": "Use /search/owner para buscar por CPF do proprietário",
                "status": "endpoint_not_discovered"
            }
        )
        
        # Código para quando endpoint estiver disponível:
        # vehicle_data = await work_client.search_vehicle_by_plate(search.plate)
        # if not vehicle_data:
        #     raise HTTPException(status_code=404, detail="Veículo não encontrado")
        # 
        # # Criar/atualizar no banco
        # if existing:
        #     for field, value in vehicle_data.items():
        #         setattr(existing, field, value)
        #     existing.updated_at = datetime.utcnow()
        #     db.commit()
        #     db.refresh(existing)
        #     return existing
        # 
        # db_vehicle = Vehicle(
        #     **vehicle_data,
        #     dossier_id=dossier_id,
        #     data_source="work_consultoria"
        # )
        # db.add(db_vehicle)
        # db.commit()
        # db.refresh(db_vehicle)
        # return db_vehicle
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar veículo: {str(e)}")


# ===== BUSCA POR PROPRIETÁRIO =====

@router.post("/search/owner", response_model=VehicleListResponse)
async def search_vehicles_by_owner(
    search: VehicleSearchByOwner,
    save_to_db: bool = Query(True),
    dossier_id: Optional[UUID] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Busca veículos por CPF do proprietário na API Work Consultoria
    
    Este endpoint FUNCIONA! Usa /consults/gate_1/proprietario/
    """
    try:
        # Buscar na Work API
        vehicles_data = await work_client.search_vehicles_by_owner_cpf(search.owner_cpf)
        
        if not vehicles_data:
            # Retornar lista vazia se não encontrou
            return {"total": 0, "items": []}
        
        saved_vehicles = []
        
        # Processar cada veículo retornado
        for vehicle_data in vehicles_data:
            # Verificar se já existe
            existing = None
            if vehicle_data.get("plate"):
                existing = db.query(Vehicle).filter(Vehicle.plate == vehicle_data["plate"]).first()
            
            if existing and save_to_db:
                # Atualizar existente
                for field, value in vehicle_data.items():
                    if hasattr(existing, field):
                        setattr(existing, field, value)
                existing.updated_at = datetime.utcnow()
                db.commit()
                db.refresh(existing)
                saved_vehicles.append(existing)
            elif save_to_db:
                # Criar novo
                db_vehicle = Vehicle(
                    **vehicle_data,
                    owner_cpf=search.owner_cpf,
                    dossier_id=dossier_id,
                    data_source="work_consultoria"
                )
                db.add(db_vehicle)
                db.commit()
                db.refresh(db_vehicle)
                saved_vehicles.append(db_vehicle)
            else:
                # Apenas retornar dados sem salvar
                saved_vehicles.append(Vehicle(**vehicle_data))
        
        return {"total": len(saved_vehicles), "items": saved_vehicles}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar veículos: {str(e)}")


# ===== BUSCA POR CONDUTOR =====

@router.post("/search/driver", response_model=VehicleListResponse)
async def search_vehicles_by_driver(
    search: VehicleSearchByDriver,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Busca veículos por CPF do condutor no banco de dados local
    """
    query = db.query(Vehicle).filter(Vehicle.driver_cpf == search.driver_cpf)
    total = query.count()
    vehicles = query.offset(skip).limit(limit).all()
    
    return {"total": total, "items": vehicles}


# ===== DETECÇÕES DE RADAR =====

@router.post("/{vehicle_id}/radar", response_model=RadarDetectionResponse, status_code=status.HTTP_201_CREATED)
async def add_radar_detection(
    vehicle_id: UUID,
    detection: RadarDetectionCreate,
    db: Session = Depends(get_db)
):
    """
    Adiciona detecção de radar para um veículo
    """
    # Verificar se veículo existe
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    # Criar detecção
    db_detection = VehicleRadarDetection(**detection.dict())
    db.add(db_detection)
    
    # Atualizar JSONB do veículo também (para buscas rápidas)
    if not vehicle.radar_detections:
        vehicle.radar_detections = []
    vehicle.radar_detections.append(detection.dict())
    
    db.commit()
    db.refresh(db_detection)
    return db_detection


@router.get("/{vehicle_id}/radar", response_model=RadarDetectionListResponse)
async def get_vehicle_radar_history(
    vehicle_id: UUID,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    has_fine: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Busca histórico de detecções de radar de um veículo
    """
    # Verificar se veículo existe
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    # Query
    query = db.query(VehicleRadarDetection).filter(VehicleRadarDetection.vehicle_id == vehicle_id)
    
    if start_date:
        query = query.filter(VehicleRadarDetection.detection_date >= start_date)
    if end_date:
        query = query.filter(VehicleRadarDetection.detection_date <= end_date)
    if has_fine is not None:
        query = query.filter(VehicleRadarDetection.has_fine == has_fine)
    
    query = query.order_by(VehicleRadarDetection.detection_date.desc())
    
    total = query.count()
    detections = query.offset(skip).limit(limit).all()
    
    return {"total": total, "vehicle_id": vehicle_id, "items": detections}


@router.post("/search/radar", response_model=VehicleListResponse)
async def search_vehicles_by_radar_location(
    search: VehicleSearchByRadar,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Busca veículos que passaram por determinada localização de radar
    """
    # Query nas detecções
    query = db.query(VehicleRadarDetection)
    
    if search.location:
        query = query.filter(VehicleRadarDetection.location.ilike(f"%{search.location}%"))
    if search.start_date:
        query = query.filter(VehicleRadarDetection.detection_date >= search.start_date)
    if search.end_date:
        query = query.filter(VehicleRadarDetection.detection_date <= search.end_date)
    if search.min_speed:
        query = query.filter(VehicleRadarDetection.speed >= search.min_speed)
    if search.has_fine is not None:
        query = query.filter(VehicleRadarDetection.has_fine == search.has_fine)
    
    # Pegar IDs únicos de veículos
    detections = query.all()
    vehicle_ids = list(set([d.vehicle_id for d in detections]))
    
    # Buscar veículos
    vehicles_query = db.query(Vehicle).filter(Vehicle.id.in_(vehicle_ids))
    total = vehicles_query.count()
    vehicles = vehicles_query.offset(skip).limit(limit).all()
    
    return {"total": total, "items": vehicles}


# ===== LINK COM DOSSIÊ =====

@router.post("/{vehicle_id}/link-dossier/{dossier_id}", response_model=VehicleResponse)
async def link_vehicle_to_dossier(
    vehicle_id: UUID,
    dossier_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Vincula veículo a um dossiê
    """
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Veículo não encontrado")
    
    vehicle.dossier_id = dossier_id
    vehicle.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(vehicle)
    return vehicle
