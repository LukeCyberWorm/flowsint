"""
Proxy para Work Consultoria API
Este módulo serve como proxy para as APIs da Work Consultoria,
resolvendo problemas de CORS no frontend.
"""
from fastapi import APIRouter, HTTPException
from typing import Optional
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

WORK_API_BASE_URL = "https://api.workconsultoria.com/api/v1/consults/gate_1"

# Headers de autenticação da Work API
WORK_API_HEADERS = {
    "access-token": "ASuQzmqTtELCFFZ1n-cf5A",
    "client": "Li0q0j0gkv34Yi0VrWKtmQ",
    "expiry": "1766545120",
    "token-type": "Bearer",
    "uid": "lukecyberworm",
    "Accept": "application/json",
}


@router.get("/cpf/{cpf}")
async def search_cpf(cpf: str):
    """
    Busca informações de CPF via Work Consultoria API
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{WORK_API_BASE_URL}/cpf/{cpf}",
                headers=WORK_API_HEADERS
            )
            
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="CPF não encontrado")
            
            response.raise_for_status()
            return response.json()
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Erro na API Work: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Erro ao conectar com Work API: {str(e)}"
        )


@router.get("/cnpj/{cnpj}")
async def search_cnpj(cnpj: str):
    """
    Busca informações de CNPJ via Work Consultoria API
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{WORK_API_BASE_URL}/cnpj/{cnpj}",
                headers=WORK_API_HEADERS
            )
            
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="CNPJ não encontrado")
            
            response.raise_for_status()
            return response.json()
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Erro na API Work: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Erro ao conectar com Work API: {str(e)}"
        )


@router.get("/telefone/{telefone}")
async def search_telefone(telefone: str):
    """
    Busca informações de telefone via Work Consultoria API
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{WORK_API_BASE_URL}/telefone/{telefone}",
                headers=WORK_API_HEADERS
            )
            
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Telefone não encontrado")
            
            response.raise_for_status()
            return response.json()
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Erro na API Work: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Erro ao conectar com Work API: {str(e)}"
        )


@router.get("/veiculo/{placa}")
async def search_veiculo(placa: str):
    """
    Busca informações de veículo via Work Consultoria API
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{WORK_API_BASE_URL}/veiculo/{placa}",
                headers=WORK_API_HEADERS
            )
            
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Veículo não encontrado")
            
            response.raise_for_status()
            return response.json()
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Erro na API Work: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Erro ao conectar com Work API: {str(e)}"
        )


@router.get("/email/{email}")
async def search_email(email: str):
    """
    Busca informações de email via Work Consultoria API
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(
                f"{WORK_API_BASE_URL}/email/{email}",
                headers=WORK_API_HEADERS
            )
            
            if response.status_code == 404:
                raise HTTPException(status_code=404, detail="Email não encontrado")
            
            response.raise_for_status()
            return response.json()
            
    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Erro na API Work: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Erro ao conectar com Work API: {str(e)}"
        )
