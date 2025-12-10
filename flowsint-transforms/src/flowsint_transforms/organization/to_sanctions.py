"""
Transform para buscar empresas sancionadas no Portal da Transparência (Brasil).
Verifica se uma organização (CNPJ) possui sanções registradas.
"""

import requests
from typing import List, Optional, Dict, Any
from flowsint_core.core.transform_base import Transform
from flowsint_types.organization import Organization
from flowsint_core.core.logger import Logger


class OrgToSanctionsTransform(Transform):
    """[Portal da Transparência] Verifica se empresa está sancionada (Brasil)."""

    InputType = Organization
    OutputType = Organization

    @classmethod
    def name(cls) -> str:
        return "org_to_sanctions_br"

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
                {"message": "Transform org_to_sanctions_br requer PORTAL_TRANSPARENCIA_API_KEY no Vault"}
            )
            return []

        results: List[OutputType] = []
        base_url = "https://api.portaldatransparencia.gov.br/api-de-dados/ceis"
        headers = {
            "chave-api-dados": api_key,
            "Accept": "application/json"
        }

        for org in data:
            # Tenta extrair CNPJ de vários campos possíveis
            cnpj = None
            if hasattr(org, 'siren') and org.siren:
                cnpj = self._clean_cnpj(str(org.siren))
            elif hasattr(org, 'cnpj') and org.cnpj:
                cnpj = self._clean_cnpj(str(org.cnpj))
            
            if not cnpj or len(cnpj) != 14:
                # Se não tem CNPJ válido, busca por nome
                try:
                    params = {
                        "codigoSancionado": org.name if hasattr(org, 'name') else str(org),
                        "pagina": 1
                    }
                    response = requests.get(base_url, headers=headers, params=params, timeout=10)
                    
                    if response.status_code == 200:
                        sanctions = response.json()
                        if sanctions:
                            enriched_org = self._enrich_with_sanctions(org, sanctions)
                            if enriched_org:
                                results.append(enriched_org)
                    elif response.status_code == 404:
                        Logger.info(
                            self.sketch_id,
                            {"message": f"Empresa {org.name} não encontrada em sanções"}
                        )
                    else:
                        Logger.warn(
                            self.sketch_id,
                            {"message": f"Erro na API: Status {response.status_code}"}
                        )
                except Exception as e:
                    Logger.error(
                        self.sketch_id,
                        {"message": f"Erro buscando sanções para {org.name}: {e}"}
                    )
            else:
                # Busca por CNPJ
                try:
                    params = {
                        "codigoSancionado": cnpj,
                        "pagina": 1
                    }
                    response = requests.get(base_url, headers=headers, params=params, timeout=10)
                    
                    if response.status_code == 200:
                        sanctions = response.json()
                        if sanctions:
                            enriched_org = self._enrich_with_sanctions(org, sanctions)
                            if enriched_org:
                                results.append(enriched_org)
                    elif response.status_code == 404:
                        Logger.info(
                            self.sketch_id,
                            {"message": f"CNPJ {cnpj} não encontrado em sanções"}
                        )
                except Exception as e:
                    Logger.error(
                        self.sketch_id,
                        {"message": f"Erro buscando sanções para CNPJ {cnpj}: {e}"}
                    )

        return results

    def _enrich_with_sanctions(self, org: Organization, sanctions: List[Dict[str, Any]]) -> Optional[Organization]:
        """Enriquece organização com dados de sanções."""
        try:
            if not sanctions:
                return None

            # Pega a primeira sanção (mais recente)
            sanction = sanctions[0]
            
            # Cria cópia da organização com dados enriquecidos
            org_dict = org.model_dump()
            
            # Adiciona informações de sanção
            org_dict["cnpj"] = sanction.get("cnpjSancionado")
            org_dict["sanctioned"] = True
            org_dict["sanction_type"] = sanction.get("tipoSancao")
            org_dict["sanction_date"] = sanction.get("dataPublicacao")
            org_dict["sanction_organ"] = sanction.get("orgaoSancionador")
            org_dict["sanction_reason"] = sanction.get("fundamentacaoLegal")
            org_dict["sanction_value"] = sanction.get("valorMulta")
            org_dict["sanction_start_date"] = sanction.get("dataInicioSancao")
            org_dict["sanction_end_date"] = sanction.get("dataFinalSancao")
            
            # Se tinha nome vazio, usa o da sanção
            if not org_dict.get("name"):
                org_dict["name"] = sanction.get("nomeSancionado", "Desconhecido")
            
            return Organization(**org_dict)
            
        except Exception as e:
            Logger.error(
                self.sketch_id,
                {"message": f"Erro enriquecendo organização com sanções: {e}"}
            )
            return None
