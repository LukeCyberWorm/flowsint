"""
Work Consultoria API Client
Cliente Python para integração com API Work Consultoria
"""

import httpx
from typing import Dict, Any, Optional, List
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()


class WorkConsultoriaClient:
    """Cliente para API Work Consultoria"""
    
    def __init__(self):
        self.base_url = os.getenv("WORK_API_URL", "https://api.workconsultoria.com/api/v1")
        
        # Tokens de autenticação (serão atualizados após cada requisição)
        self.headers = {
            "access-token": os.getenv("WORK_ACCESS_TOKEN", ""),
            "client": os.getenv("WORK_CLIENT", ""),
            "expiry": os.getenv("WORK_EXPIRY", ""),
            "token-type": "Bearer",
            "uid": os.getenv("WORK_UID", ""),
            "accept": "application/json, text/plain, */*"
        }
        
        # Cookie Cloudflare (necessário para evitar 403)
        self.cf_cookie = os.getenv("WORK_CF_CLEARANCE", "")
        
    async def _request(
        self, 
        method: str, 
        endpoint: str, 
        **kwargs
    ) -> httpx.Response:
        """
        Faz requisição à API e atualiza tokens
        
        Args:
            method: Método HTTP (GET, POST, etc.)
            endpoint: Endpoint da API (ex: '/users/me')
            **kwargs: Argumentos adicionais para httpx
        """
        headers = self.headers.copy()
        if self.cf_cookie:
            headers["Cookie"] = f"cf_clearance={self.cf_cookie}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=method,
                url=f"{self.base_url}{endpoint}",
                headers=headers,
                **kwargs
            )
            
            # Atualizar tokens para próximas requisições
            if "access-token" in response.headers:
                self.headers["access-token"] = response.headers["access-token"]
            if "client" in response.headers:
                self.headers["client"] = response.headers["client"]
            if "expiry" in response.headers:
                self.headers["expiry"] = response.headers["expiry"]
            
            response.raise_for_status()
            return response
    
    async def get_user_info(self) -> Dict[str, Any]:
        """
        Obtém informações do usuário autenticado
        Retorna: Dados do usuário incluindo créditos disponíveis
        """
        response = await self._request("GET", "/users/me")
        return response.json()
    
    async def get_plans(self) -> List[Dict[str, Any]]:
        """Retorna lista de planos disponíveis"""
        response = await self._request("GET", "/plans")
        data = response.json()
        return data.get("data", [])
    
    # ===== CONSULTAS CPF =====
    
    async def search_cpf(self, cpf: str) -> Dict[str, Any]:
        """
        Consulta CPF básica
        
        Args:
            cpf: CPF sem formatação (apenas números)
        """
        response = await self._request("GET", f"/consults/gate_1/cpf/?cpf={cpf}")
        return response.json()
    
    async def search_cpf_complete(self, cpf: str) -> Dict[str, Any]:
        """
        Consulta CPF completa (consome crédito)
        
        Args:
            cpf: CPF sem formatação
        """
        response = await self._request("GET", f"/consults/gate_1/cpf_completa/?cpf={cpf}")
        return response.json()
    
    async def search_receita(self, cpf: str) -> Dict[str, Any]:
        """
        Consulta Receita Federal por CPF
        
        Args:
            cpf: CPF sem formatação
        """
        response = await self._request("GET", f"/consults/gate_1/receita/{cpf}")
        return response.json()
    
    # ===== CONSULTAS EMAIL =====
    
    async def search_email(self, email: str) -> Dict[str, Any]:
        """
        Busca vazamentos de email
        
        Args:
            email: Endereço de email
        
        Returns:
            {
                "total": int,
                "msg": list
            }
        """
        response = await self._request("GET", f"/consults/gate_1/email/?email={email}")
        return response.json()
    
    # ===== CONSULTAS VEÍCULOS =====
    
    async def search_vehicles_by_owner_cpf(self, cpf: str) -> Optional[List[Dict[str, Any]]]:
        """
        Busca veículos por CPF do proprietário
        
        Args:
            cpf: CPF do proprietário sem formatação
        
        Returns:
            Lista de veículos ou None se não encontrado
        """
        response = await self._request("GET", f"/consults/gate_1/proprietario/?cpf={cpf}")
        data = response.json()
        
        # Se retornar null, significa que não há veículos
        if data is None:
            return None
        
        # Se retornar lista/objeto, processar
        if isinstance(data, list):
            return data
        elif isinstance(data, dict):
            return [data]
        
        return None
    
    async def search_vehicle_by_plate(self, plate: str) -> Dict[str, Any]:
        """
        Busca veículo por placa (ENDPOINT A SER DESCOBERTO)
        
        Args:
            plate: Placa do veículo (formato: ABC1234 ou ABC1D23)
        
        NOTE: Endpoint ainda não descoberto.
              Retorna erro 404 atualmente.
              Aguardando captura de request real do portal.
        """
        # Tentar múltiplas possibilidades
        endpoints_to_try = [
            f"/consults/gate_1/placa/?placa={plate}",
            f"/consults/gate_1/placa_veicular/?placa={plate}",
            f"/consults/gate_1/vehicle/?plate={plate}",
        ]
        
        last_error = None
        
        for endpoint in endpoints_to_try:
            try:
                response = await self._request("GET", endpoint)
                return response.json()
            except httpx.HTTPStatusError as e:
                last_error = e
                continue
        
        # Se nenhum funcionou, lançar último erro
        if last_error:
            raise last_error
        
        return {"error": "Nenhum endpoint de veículos disponível"}
    
    # ===== UTILITIES =====
    
    async def check_credits(self) -> Dict[str, int]:
        """
        Verifica créditos disponíveis por módulo
        
        Returns:
            Dict com módulos e créditos: {"cpf_completa": 9, "email": 2, ...}
        """
        user_info = await self.get_user_info()
        modules = user_info.get("modules", {})
        
        # Converter strings para integers
        credits = {
            module: int(credits) 
            for module, credits in modules.items()
            if int(credits) > 0
        }
        
        return credits
    
    async def get_balance(self) -> float:
        """Retorna saldo em conta (R$)"""
        user_info = await self.get_user_info()
        return float(user_info.get("balance", 0))
    
    async def get_plan_info(self) -> Dict[str, Any]:
        """Retorna informações do plano atual"""
        user_info = await self.get_user_info()
        return user_info.get("plan", {})


# Singleton instance
work_client = WorkConsultoriaClient()


# ===== EXEMPLO DE USO =====

async def example_usage():
    """Exemplo de como usar o cliente"""
    
    # Verificar créditos disponíveis
    credits = await work_client.check_credits()
    print(f"Créditos disponíveis: {credits}")
    
    # Consultar CPF
    cpf_data = await work_client.search_cpf("04151107690")
    print(f"Dados CPF: {cpf_data}")
    
    # Buscar veículos por CPF do proprietário
    vehicles = await work_client.search_vehicles_by_owner_cpf("04151107690")
    print(f"Veículos: {vehicles}")
    
    # Buscar vazamentos de email
    email_data = await work_client.search_email("teste@example.com")
    print(f"Email data: {email_data}")


if __name__ == "__main__":
    import asyncio
    asyncio.run(example_usage())
