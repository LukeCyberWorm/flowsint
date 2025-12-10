import requests
from typing import List, Dict, Any, Union
from flowsint_core.core.transform_base import Transform
from flowsint_types.organization import Organization
from flowsint_core.core.logger import Logger


class CNPJToAgreementsTransform(Transform):
    """[Portal Transparência BR] Get government agreements by CNPJ."""

    InputType = Organization
    OutputType = Organization

    @classmethod
    def name(cls) -> str:
        return "cnpj_to_agreements"

    @classmethod
    def category(cls) -> str:
        return "Organization"

    @classmethod
    def key(cls) -> str:
        return "cnpj"

    def preprocess(self, data: Union[List[str], List[dict], List[Organization]]) -> List[Organization]:
        cleaned: List[Organization] = []
        for item in data:
            if isinstance(item, str):
                cleaned.append(Organization(name="", cnpj=item.strip()))
            elif isinstance(item, dict) and item.get("cnpj"):
                cleaned.append(Organization(**item))
            elif isinstance(item, Organization) and item.cnpj:
                cleaned.append(item)
        return cleaned

    async def scan(self, data: List[InputType]) -> List[OutputType]:
        api_key = self.get_secret("PORTAL_TRANSPARENCIA_API_KEY")
        if not api_key:
            Logger.warn(self.sketch_id, {"message": "PORTAL_TRANSPARENCIA_API_KEY not found in Vault"})
            return []

        results: List[OutputType] = []
        for org in data:
            try:
                cnpj_clean = org.cnpj.replace(".", "").replace("/", "").replace("-", "")
                url = f"https://api.portaldatransparencia.gov.br/api-de-dados/convenios?cnpjBeneficiario={cnpj_clean}"
                headers = {"chave-api-dados": api_key}
                response = requests.get(url, headers=headers, timeout=30)
                
                if response.status_code == 200:
                    agreements = response.json()
                    if agreements:
                        org_with_agreements = Organization(
                            name=org.name or agreements[0].get("nomeProponente", ""),
                            cnpj=org.cnpj,
                            agreements=agreements
                        )
                        results.append(org_with_agreements)
                        Logger.info(self.sketch_id, {"message": f"Found {len(agreements)} agreements for CNPJ {org.cnpj}"})
            except Exception as e:
                Logger.error(self.sketch_id, {"message": f"Error getting agreements for {org.cnpj}: {e}"})
        return results
