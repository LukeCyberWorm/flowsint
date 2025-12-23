"""
Pydantic schemas for Vehicle Entity
Validação de dados de veículos
"""
from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


# ===== RADAR DETECTION SCHEMAS =====

class RadarDetectionBase(BaseModel):
    """Schema base para detecção de radar"""
    detection_date: datetime
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    speed: Optional[float] = None
    speed_limit: Optional[float] = None
    over_limit: Optional[float] = None
    radar_type: Optional[str] = None
    radar_id: Optional[str] = None
    direction: Optional[str] = None
    has_fine: Optional[bool] = False
    fine_value: Optional[float] = None
    fine_code: Optional[str] = None
    image_url: Optional[str] = None


class RadarDetectionCreate(RadarDetectionBase):
    """Schema para criar detecção de radar"""
    vehicle_id: UUID


class RadarDetectionResponse(RadarDetectionBase):
    """Schema de resposta de detecção de radar"""
    id: UUID
    vehicle_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True


# ===== VEHICLE SCHEMAS =====

class VehicleBase(BaseModel):
    """Schema base para veículo"""
    plate: Optional[str] = Field(None, max_length=10, description="Placa do veículo")
    chassi: Optional[str] = Field(None, max_length=17, description="Chassi")
    renavam: Optional[str] = Field(None, max_length=11, description="RENAVAM")
    brand: Optional[str] = Field(None, max_length=100, description="Marca")
    model: Optional[str] = Field(None, max_length=100, description="Modelo")
    year_manufacture: Optional[int] = Field(None, ge=1900, le=2100, description="Ano de fabricação")
    year_model: Optional[int] = Field(None, ge=1900, le=2100, description="Ano do modelo")
    color: Optional[str] = Field(None, max_length=50, description="Cor")
    fuel_type: Optional[str] = Field(None, max_length=50, description="Tipo de combustível")
    owner_name: Optional[str] = None
    owner_cpf: Optional[str] = Field(None, max_length=11, description="CPF sem formatação")
    driver_name: Optional[str] = None
    driver_cpf: Optional[str] = Field(None, max_length=11, description="CPF sem formatação")
    category: Optional[str] = None
    engine_number: Optional[str] = None
    capacity: Optional[str] = None
    
    @validator("owner_cpf", "driver_cpf")
    def validate_cpf(cls, v):
        """Valida formato de CPF"""
        if v is None:
            return v
        # Remove formatação
        cpf = "".join(filter(str.isdigit, v))
        if len(cpf) != 11:
            raise ValueError("CPF deve ter 11 dígitos")
        return cpf
    
    @validator("plate")
    def validate_plate(cls, v):
        """Valida formato de placa"""
        if v is None:
            return v
        # Remove espaços e converte para maiúscula
        plate = v.replace(" ", "").upper()
        # Aceita formatos: ABC1234 ou ABC1D23 (Mercosul)
        if len(plate) < 7 or len(plate) > 7:
            raise ValueError("Placa deve ter 7 caracteres")
        return plate


class VehicleCreate(VehicleBase):
    """Schema para criar veículo"""
    dossier_id: Optional[UUID] = None
    investigation_id: Optional[UUID] = None
    data_source: Optional[str] = "manual"
    raw_data: Optional[Dict[str, Any]] = None


class VehicleUpdate(BaseModel):
    """Schema para atualizar veículo"""
    plate: Optional[str] = None
    chassi: Optional[str] = None
    renavam: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    year_manufacture: Optional[int] = None
    year_model: Optional[int] = None
    color: Optional[str] = None
    fuel_type: Optional[str] = None
    owner_name: Optional[str] = None
    owner_cpf: Optional[str] = None
    driver_name: Optional[str] = None
    driver_cpf: Optional[str] = None
    category: Optional[str] = None
    radar_detections: Optional[List[Dict[str, Any]]] = None
    has_restrictions: Optional[bool] = None
    restrictions: Optional[List[Dict[str, Any]]] = None
    has_fines: Optional[bool] = None
    fines_total: Optional[float] = None


class VehicleResponse(VehicleBase):
    """Schema de resposta de veículo"""
    id: UUID
    radar_detections: Optional[List[Dict[str, Any]]] = None
    has_restrictions: Optional[bool] = False
    restrictions: Optional[List[Dict[str, Any]]] = None
    has_fines: Optional[bool] = False
    fines_total: Optional[float] = None
    data_source: Optional[str] = None
    investigation_id: Optional[UUID] = None
    dossier_id: Optional[UUID] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class VehicleWithDetections(VehicleResponse):
    """Schema de veículo com detecções de radar"""
    detections: List[RadarDetectionResponse] = []


# ===== SEARCH SCHEMAS =====

class VehicleSearchByPlate(BaseModel):
    """Schema para busca por placa"""
    plate: str = Field(..., description="Placa do veículo (ABC1234 ou ABC1D23)")
    
    @validator("plate")
    def validate_plate(cls, v):
        """Valida e formata placa"""
        plate = v.replace(" ", "").replace("-", "").upper()
        if len(plate) != 7:
            raise ValueError("Placa deve ter 7 caracteres")
        return plate


class VehicleSearchByOwner(BaseModel):
    """Schema para busca por proprietário"""
    owner_cpf: str = Field(..., description="CPF do proprietário (apenas números)")
    
    @validator("owner_cpf")
    def validate_cpf(cls, v):
        """Valida CPF"""
        cpf = "".join(filter(str.isdigit, v))
        if len(cpf) != 11:
            raise ValueError("CPF deve ter 11 dígitos")
        return cpf


class VehicleSearchByDriver(BaseModel):
    """Schema para busca por condutor"""
    driver_cpf: str = Field(..., description="CPF do condutor (apenas números)")
    
    @validator("driver_cpf")
    def validate_cpf(cls, v):
        """Valida CPF"""
        cpf = "".join(filter(str.isdigit, v))
        if len(cpf) != 11:
            raise ValueError("CPF deve ter 11 dígitos")
        return cpf


class VehicleSearchByRadar(BaseModel):
    """Schema para busca por localização de radar"""
    location: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    min_speed: Optional[float] = None
    has_fine: Optional[bool] = None


# ===== RESPONSE WRAPPERS =====

class VehicleListResponse(BaseModel):
    """Schema de resposta para lista de veículos"""
    total: int
    items: List[VehicleResponse]


class RadarDetectionListResponse(BaseModel):
    """Schema de resposta para lista de detecções"""
    total: int
    vehicle_id: UUID
    items: List[RadarDetectionResponse]
