import requests
from typing import List, Dict, Any, Union
from flowsint_core.core.transform_base import Transform
from flowsint_types.individual import Individual
from flowsint_core.core.logger import Logger


class CPFToPublicServantTransform(Transform):
    """[Portal Transparência BR] Get public servant data by CPF."""

    InputType = Individual
    OutputType = Individual

    @classmethod
    def get_params_schema(cls) -> List[Dict[str, Any]]:
        """Declare required parameters for this transform"""
        return [
            {
                "name": "PORTAL_TRANSPARENCIA_API_KEY",
                "type": "vaultSecret",
                "description": "API key do Portal da Transparência para buscar servidores públicos.",
                "required": True,
            },
        ]

    @classmethod
    def name(cls) -> str:
        return "cpf_to_public_servant"

    @classmethod
    def category(cls) -> str:
        return "Individual"

    @classmethod
    def key(cls) -> str:
        return "cpf"

    def preprocess(self, data: Union[List[str], List[dict], List[Individual]]) -> List[Individual]:
        cleaned: List[Individual] = []
        for item in data:
            if isinstance(item, str):
                cleaned.append(Individual(first_name="", last_name="", cpf=item.strip()))
            elif isinstance(item, dict) and item.get("cpf"):
                cleaned.append(Individual(**item))
            elif isinstance(item, Individual) and item.cpf:
                cleaned.append(item)
        return cleaned

    async def scan(self, data: List[InputType]) -> List[OutputType]:
        api_key = self.get_secret("PORTAL_TRANSPARENCIA_API_KEY")
        if not api_key:
            Logger.warn(self.sketch_id, {"message": "PORTAL_TRANSPARENCIA_API_KEY not found in Vault"})
            return []

        results: List[OutputType] = []
        for individual in data:
            try:
                cpf_clean = individual.cpf.replace(".", "").replace("-", "")
                url = f"https://api.portaldatransparencia.gov.br/api-de-dados/servidores?cpf={cpf_clean}&pagina=1"
                headers = {"chave-api-dados": api_key}
                
                Logger.info(self.sketch_id, {"message": f"Calling API: {url[:80]}"})
                response = requests.get(url, headers=headers, timeout=30)
                
                Logger.info(self.sketch_id, {"message": f"API Response Status: {response.status_code}"})
                Logger.info(self.sketch_id, {"message": f"API Response Body: {response.text[:500]}"})
                
                if response.status_code == 200:
                    servants = response.json()
                    if isinstance(servants, list) and servants:
                        servant_data = servants[0]
                        enriched_individual = Individual(
                            first_name=individual.first_name or "",
                            last_name=individual.last_name or "",
                            full_name=servant_data.get("nome", ""),
                            cpf=individual.cpf,
                            public_servant_data=servant_data
                        )
                        results.append(enriched_individual)
                        Logger.info(self.sketch_id, {"message": f"Found public servant data for CPF"})
                else:
                    Logger.error(self.sketch_id, {"message": f"API returned status {response.status_code}: {response.text[:200]}"})
            except Exception as e:
                Logger.error(self.sketch_id, {"message": f"Error getting servant data for CPF: {str(e)}"})
        return results
