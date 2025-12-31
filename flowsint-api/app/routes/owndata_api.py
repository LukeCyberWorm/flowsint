"""
OwnData API Proxy
Proxy para chamadas à API da OwnData para evitar problemas de CORS
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx
import os
from typing import Optional

router = APIRouter()

OWNDATA_API_URL = os.getenv("OWNDATA_API_URL", "https://completa.workbuscas.com/api")
OWNDATA_TOKEN = os.getenv("OWNDATA_TOKEN", "HhsbkqwwpEJIhEZPQGAPOjmC")

# Request models
class CpfRequest(BaseModel):
    cpf: str

class CnpjRequest(BaseModel):
    cnpj: str

class PhoneRequest(BaseModel):
    phone: str

class EmailRequest(BaseModel):
    email: str

class NameRequest(BaseModel):
    name: str

class CepRequest(BaseModel):
    cep: str

class TitleRequest(BaseModel):
    title: str

class MotherRequest(BaseModel):
    mother: str

# Helper function to sanitize numeric inputs
def sanitize_numeric(value: str) -> str:
    """Remove non-numeric characters"""
    return ''.join(c for c in value if c.isdigit())

async def call_owndata_api(modulo: str, consulta: str) -> dict:
    """Make request to OwnData API using GET with query parameters"""
    params = {
        "token": OWNDATA_TOKEN,
        "modulo": modulo,
        "consulta": consulta
    }
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            response = await client.get(OWNDATA_API_URL, params=params)
            response.raise_for_status()
            
            # Get response text
            text = response.text.strip()
            
            # If empty response, no data found
            if not text:
                return {
                    "success": True,
                    "data": {
                        "status": 404,
                        "statusMsg": "Not found",
                        "reason": "Nenhum dado encontrado na base da OwnData para esta consulta"
                    }
                }
            
            # Try to parse JSON response
            try:
                data = response.json()
                return {"success": True, "data": data}
            except:
                # If response is not valid JSON
                return {
                    "success": False,
                    "error": "Resposta inválida da API OwnData",
                    "details": text
                }
        except httpx.HTTPStatusError as e:
            return {
                "success": False,
                "error": f"Erro na API: {e.response.status_code}",
                "details": e.response.text
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

@router.post("/cpf")
async def search_cpf(request: CpfRequest):
    """Buscar dados por CPF"""
    cpf = sanitize_numeric(request.cpf)
    return await call_owndata_api("cpf", cpf)

@router.post("/cnpj")
async def search_cnpj(request: CnpjRequest):
    """Buscar dados por CNPJ"""
    cnpj = sanitize_numeric(request.cnpj)
    return await call_owndata_api("cnpj", cnpj)

@router.post("/phone")
async def search_phone(request: PhoneRequest):
    """Buscar dados por Telefone"""
    phone = sanitize_numeric(request.phone)
    return await call_owndata_api("phone", phone)

@router.post("/email")
async def search_email(request: EmailRequest):
    """Buscar dados por Email"""
    return await call_owndata_api("mail", request.email.strip())

@router.post("/name")
async def search_name(request: NameRequest):
    """Buscar dados por Nome"""
    return await call_owndata_api("name", request.name.strip())

@router.post("/cep")
async def search_cep(request: CepRequest):
    """Buscar dados por CEP"""
    cep = sanitize_numeric(request.cep)
    return await call_owndata_api("cep", cep)

@router.post("/title")
async def search_title(request: TitleRequest):
    """Buscar dados por Título Eleitor"""
    title = sanitize_numeric(request.title)
    return await call_owndata_api("title", title)

@router.post("/mother")
async def search_mother(request: MotherRequest):
    """Buscar dados por Nome da Mãe"""
    return await call_owndata_api("mother", request.mother.strip())
