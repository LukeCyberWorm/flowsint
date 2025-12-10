import requests
from typing import List, Dict, Any, Union
from flowsint_core.core.transform_base import Transform
from flowsint_types.individual import Individual
from flowsint_core.core.logger import Logger


class NameToPublicServantTransform(Transform):
    """[Portal Transparência BR] Get public servant data by name."""

    InputType = Individual
    OutputType = Individual

    @classmethod
    def name(cls) -> str:
        return "name_to_public_servant"

    @classmethod
    def category(cls) -> str:
        return "Individual"

    @classmethod
    def key(cls) -> str:
        return "full_name"

    def preprocess(self, data: Union[List[str], List[dict], List[Individual]]) -> List[Individual]:
        cleaned: List[Individual] = []
        for item in data:
            if isinstance(item, str):
                parts = item.strip().split()
                if len(parts) >= 2:
                    first = parts[0]
                    last = " ".join(parts[1:])
                    cleaned.append(Individual(first_name=first, last_name=last, full_name=item.strip()))
            elif isinstance(item, dict) and item.get("full_name"):
                cleaned.append(Individual(**item))
            elif isinstance(item, Individual) and item.full_name:
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
                url = f"https://api.portaldatransparencia.gov.br/api-de-dados/servidores?nome={individual.full_name}"
                headers = {"chave-api-dados": api_key}
                response = requests.get(url, headers=headers, timeout=30)
                
                if response.status_code == 200:
                    servants = response.json()
                    for servant_data in servants[:10]:  # Limit to 10 results
                        enriched_individual = Individual(
                            first_name=individual.first_name,
                            last_name=individual.last_name,
                            full_name=servant_data.get("nome", individual.full_name),
                            cpf=servant_data.get("cpf"),
                            public_servant_data=servant_data
                        )
                        results.append(enriched_individual)
                    
                    if results:
                        Logger.info(self.sketch_id, {"message": f"Found {len(results)} servants with name {individual.full_name}"})
            except Exception as e:
                Logger.error(self.sketch_id, {"message": f"Error searching servant by name {individual.full_name}: {e}"})
        return results
