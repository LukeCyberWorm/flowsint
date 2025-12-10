"""
Transform para buscar convênios e contratos no Portal da Transparência (Brasil).
Busca convênios de uma organização (CNPJ) com o governo federal.
"""

import requests
from typing import List, Optional, Dict, Any
from flowsint_core.core.transform_base import Transform
from flowsint_types.organization import Organization
from flowsint_core.core.logger import Logger


class OrgToContractsTransform(Transform):
    """[Portal da Transparência] Busca convênios e contratos com governo (Brasil)."""

    InputType = Organization
    OutputType = Organization

    @classmethod
    def name(cls) -> str:
        return "org_to_contracts_br"

    @classmethod
    def category(cls) -> str:
        return "Organization"

    @classmethod
    def key(cls) -> str:
        return "name"

    def _get_api_key(self) -> Optional[str]:
        """Recupera a chave da API do Vault."""
        try:
            from flowsint_core.core.vault import Vault
            vault = Vault(self.sketch_id)
            api_key = vault.get("PORTAL_TRANSPARENCIA_API_KEY")
            if not api_key:
                Logger.warn(
                    self.sketch_id,
                    {"message": "Chave PORTAL_TRANSPARENCIA_API_KEY não encontrada no Vault"}
                )
            return api_key
        except Exception as e:
            Logger.error(
                self.sketch_id,
                {"message": f"Erro ao recuperar chave da API: {e}"}
            )
            return None

    def _clean_cnpj(self, cnpj: str) -> str:
        """Remove formatação do CNPJ (pontos, barras, hífens)."""
        if not cnpj:
            return ""
        return "".join(filter(str.isdigit, cnpj))

    async def scan(self, data: List[InputType]) -> List[OutputType]:
        api_key = self._get_api_key()
        if not api_key:
            Logger.warn(
                self.sketch_id,
                {"message": "Transform org_to_contracts_br requer PORTAL_TRANSPARENCIA_API_KEY no Vault"}
            )
            return []

        results: List[OutputType] = []
        base_url = "https://api.portaldatransparencia.gov.br/api-de-dados/convenios"
        headers = {
            "chave-api-dados": api_key,
            "Accept": "application/json"
        }

        for org in data:
            # Tenta extrair CNPJ
            cnpj = None
            if hasattr(org, 'siren') and org.siren:
                cnpj = self._clean_cnpj(str(org.siren))
            elif hasattr(org, 'cnpj') and org.cnpj:
                cnpj = self._clean_cnpj(str(org.cnpj))
            
            if not cnpj or len(cnpj) != 14:
                Logger.warn(
                    self.sketch_id,
                    {"message": f"Organização {org.name} não possui CNPJ válido para busca de convênios"}
                )
                continue

            try:
                params = {
                    "codigoConvenente": cnpj,
                    "pagina": 1
                }
                response = requests.get(base_url, headers=headers, params=params, timeout=10)
                
                if response.status_code == 200:
                    contracts = response.json()
                    if contracts:
                        enriched_org = self._enrich_with_contracts(org, contracts)
                        if enriched_org:
                            results.append(enriched_org)
                elif response.status_code == 404:
                    Logger.info(
                        self.sketch_id,
                        {"message": f"CNPJ {cnpj} não possui convênios registrados"}
                    )
                else:
                    Logger.warn(
                        self.sketch_id,
                        {"message": f"Erro na API: Status {response.status_code}"}
                    )
            except Exception as e:
                Logger.error(
                    self.sketch_id,
                    {"message": f"Erro buscando convênios para CNPJ {cnpj}: {e}"}
                )

        return results

    def _enrich_with_contracts(self, org: Organization, contracts: List[Dict[str, Any]]) -> Optional[Organization]:
        """Enriquece organização com dados de convênios."""
        try:
            if not contracts:
                return None

            # Cria cópia da organização com dados enriquecidos
            org_dict = org.model_dump()
            
            # Calcula totais
            total_contracts = len(contracts)
            total_value = sum(float(c.get("valorGlobalConvenio", 0) or 0) for c in contracts)
            total_transferred = sum(float(c.get("valorTransferidoUniao", 0) or 0) for c in contracts)
            
            # Pega informações do primeiro convênio (mais recente)
            latest_contract = contracts[0]
            
            org_dict["cnpj"] = latest_contract.get("codigoConvenente")
            org_dict["has_government_contracts"] = True
            org_dict["total_contracts"] = total_contracts
            org_dict["total_contract_value"] = total_value
            org_dict["total_government_transfer"] = total_transferred
            
            # Informações do último convênio
            org_dict["latest_contract_number"] = latest_contract.get("numeroConvenio")
            org_dict["latest_contract_object"] = latest_contract.get("objetoConvenio")
            org_dict["latest_contract_date"] = latest_contract.get("dataAssinaturaConvenio")
            org_dict["latest_contract_status"] = latest_contract.get("situacaoConvenio")
            org_dict["latest_contract_organ"] = latest_contract.get("orgaoSuperiorConvenente")
            org_dict["latest_contract_value"] = latest_contract.get("valorGlobalConvenio")
            org_dict["latest_contract_start"] = latest_contract.get("dataInicioVigenciaConvenio")
            org_dict["latest_contract_end"] = latest_contract.get("dataFimVigenciaConvenio")
            
            # Informações do município
            org_dict["municipality"] = latest_contract.get("municipioConvenente")
            org_dict["uf"] = latest_contract.get("ufConvenente")
            
            # Lista de todos os convênios (resumida)
            org_dict["contracts_summary"] = [
                {
                    "numero": c.get("numeroConvenio"),
                    "valor": c.get("valorGlobalConvenio"),
                    "situacao": c.get("situacaoConvenio"),
                    "data": c.get("dataAssinaturaConvenio"),
                    "orgao": c.get("orgaoSuperiorConvenente")
                }
                for c in contracts[:10]  # Limita a 10 para não sobrecarregar
            ]
            
            # Se tinha nome vazio, usa o do convênio
            if not org_dict.get("name"):
                org_dict["name"] = latest_contract.get("nomeConvenente", "Desconhecido")
            
            return Organization(**org_dict)
            
        except Exception as e:
            Logger.error(
                self.sketch_id,
                {"message": f"Erro enriquecendo organização com convênios: {e}"}
            )
            return None
