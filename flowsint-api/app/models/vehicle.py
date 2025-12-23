"""
SQLAlchemy models for Vehicle Entity
Sistema de entidades de veículos para dossiês
"""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, Integer, Boolean, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from flowsint_core.core.postgre_db import Base


class Vehicle(Base):
    """
    Entidade Vehicle - Representa veículos em investigações
    Armazena dados de veículos obtidos via Work Consultoria API e outras fontes
    """
    __tablename__ = "vehicles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Identificadores principais
    plate = Column(String(10), nullable=True, index=True)  # Placa (ABC1234 ou ABC1D23)
    chassi = Column(String(17), nullable=True, index=True)  # Chassi (17 caracteres)
    renavam = Column(String(11), nullable=True, index=True)  # RENAVAM
    
    # Dados do veículo
    brand = Column(String(100), nullable=True)  # Marca (VOLKSWAGEN, FIAT, etc)
    model = Column(String(100), nullable=True)  # Modelo (GOL, UNO, etc)
    year_manufacture = Column(Integer, nullable=True)  # Ano de fabricação
    year_model = Column(Integer, nullable=True)  # Ano do modelo
    color = Column(String(50), nullable=True)  # Cor
    fuel_type = Column(String(50), nullable=True)  # Tipo de combustível
    
    # Proprietário/Condutor
    owner_name = Column(Text, nullable=True)  # Nome do proprietário
    owner_cpf = Column(String(11), nullable=True, index=True)  # CPF do proprietário
    driver_name = Column(Text, nullable=True)  # Nome do condutor
    driver_cpf = Column(String(11), nullable=True, index=True)  # CPF do condutor
    
    # Dados adicionais
    category = Column(String(50), nullable=True)  # Categoria (PARTICULAR, ALUGUEL, etc)
    engine_number = Column(String(50), nullable=True)  # Número do motor
    capacity = Column(String(50), nullable=True)  # Capacidade de passageiros
    
    # Histórico de radar/passagens
    radar_detections = Column(JSONB, nullable=True)  # Histórico de detecções em radares
    # Formato: [{"date": "2025-01-01", "location": "Av. Paulista", "speed": 80, "limit": 60}, ...]
    
    # Restrições e débitos
    has_restrictions = Column(Boolean, default=False, nullable=True)  # Possui restrições?
    restrictions = Column(JSONB, nullable=True)  # Lista de restrições
    has_fines = Column(Boolean, default=False, nullable=True)  # Possui multas?
    fines_total = Column(Float, nullable=True)  # Valor total de multas
    
    # Source de dados
    data_source = Column(String(100), nullable=True)  # Fonte (work_consultoria, detran, etc)
    raw_data = Column(JSONB, nullable=True)  # Dados brutos da API
    
    # Metadados
    investigation_id = Column(UUID(as_uuid=True), nullable=True, index=True)  # Link para investigação
    dossier_id = Column(UUID(as_uuid=True), ForeignKey("dossiers.id", ondelete="SET NULL"), nullable=True, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)
    created_by = Column(UUID(as_uuid=True), nullable=True)
    
    # Relacionamento com dossier
    dossier = relationship("Dossier", backref="vehicles", foreign_keys=[dossier_id])

    def __repr__(self):
        return f"<Vehicle {self.plate} - {self.brand} {self.model}>"
    
    def to_dict(self):
        """Converte entidade para dicionário"""
        return {
            "id": str(self.id),
            "plate": self.plate,
            "chassi": self.chassi,
            "renavam": self.renavam,
            "brand": self.brand,
            "model": self.model,
            "year_manufacture": self.year_manufacture,
            "year_model": self.year_model,
            "color": self.color,
            "fuel_type": self.fuel_type,
            "owner_name": self.owner_name,
            "owner_cpf": self.owner_cpf,
            "driver_name": self.driver_name,
            "driver_cpf": self.driver_cpf,
            "category": self.category,
            "engine_number": self.engine_number,
            "capacity": self.capacity,
            "radar_detections": self.radar_detections,
            "has_restrictions": self.has_restrictions,
            "restrictions": self.restrictions,
            "has_fines": self.has_fines,
            "fines_total": self.fines_total,
            "data_source": self.data_source,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class VehicleRadarDetection(Base):
    """
    Detecções de veículos em radares
    Histórico de passagens por radares e câmeras
    """
    __tablename__ = "vehicle_radar_detections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    vehicle_id = Column(UUID(as_uuid=True), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Dados da detecção
    detection_date = Column(DateTime, nullable=False, index=True)  # Data/hora da detecção
    location = Column(Text, nullable=True)  # Localização (Av. Paulista, km 10, etc)
    latitude = Column(Float, nullable=True)  # Latitude
    longitude = Column(Float, nullable=True)  # Longitude
    
    # Dados de velocidade
    speed = Column(Float, nullable=True)  # Velocidade medida (km/h)
    speed_limit = Column(Float, nullable=True)  # Limite de velocidade (km/h)
    over_limit = Column(Float, nullable=True)  # Quanto passou do limite
    
    # Dados do radar
    radar_type = Column(String(50), nullable=True)  # Tipo (fixo, móvel, lombada)
    radar_id = Column(String(50), nullable=True)  # ID do radar
    direction = Column(String(100), nullable=True)  # Sentido (Norte-Sul, etc)
    
    # Infração
    has_fine = Column(Boolean, default=False, nullable=True)  # Gerou multa?
    fine_value = Column(Float, nullable=True)  # Valor da multa
    fine_code = Column(String(20), nullable=True)  # Código da infração
    
    # Imagem/Evidência
    image_url = Column(Text, nullable=True)  # URL da foto do radar
    
    # Metadados
    data_source = Column(String(100), nullable=True)  # Fonte dos dados
    raw_data = Column(JSONB, nullable=True)  # Dados brutos
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    
    # Relacionamento
    vehicle = relationship("Vehicle", backref="detections")

    def __repr__(self):
        return f"<RadarDetection {self.location} - {self.detection_date}>"
    
    def to_dict(self):
        """Converte detecção para dicionário"""
        return {
            "id": str(self.id),
            "vehicle_id": str(self.vehicle_id),
            "detection_date": self.detection_date.isoformat() if self.detection_date else None,
            "location": self.location,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "speed": self.speed,
            "speed_limit": self.speed_limit,
            "over_limit": self.over_limit,
            "radar_type": self.radar_type,
            "radar_id": self.radar_id,
            "direction": self.direction,
            "has_fine": self.has_fine,
            "fine_value": self.fine_value,
            "fine_code": self.fine_code,
            "image_url": self.image_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
