"""
Transform para buscar servidores públicos no Portal da Transparência (Brasil).
Busca informações de servidores por CPF ou nome.
"""

import requests
from typing import List, Optional, Dict, Any
from flowsint_core.core.transform_base import Transform
from flowsint_types.individual import Individual
from flowsint_core.core.logger import Logger


class IndividualToPublicServantTransform(Transform):
    """[Portal da Transparência] Busca servidores públicos federais (Brasil)."""

    InputType = Individual
    OutputType = Individual

    @classmethod
    def name(cls) -> str:
        return "individual_to_public_servant_br"

    @classmethod
    def category(cls) -> str:
        return "Individual"

    @classmethod
    def key(cls) -> str:
        return "full_name"

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

    def _clean_cpf(self, cpf: str) -> str:
        """Remove formatação do CPF (pontos e hífens)."""
        if not cpf:
            return ""
        return "".join(filter(str.isdigit, cpf))

    async def scan(self, data: List[InputType]) -> List[OutputType]:
        api_key = self._get_api_key()
        if not api_key:
            Logger.warn(
                self.sketch_id,
                {"message": "Transform individual_to_public_servant_br requer PORTAL_TRANSPARENCIA_API_KEY no Vault"}
            )
            return []

        results: List[OutputType] = []
        base_url = "https://api.portaldatransparencia.gov.br/api-de-dados/servidores"
        headers = {
            "chave-api-dados": api_key,
            "Accept": "application/json"
        }

        for person in data:
            # Tenta buscar por CPF primeiro
            cpf = None
            if hasattr(person, 'cpf') and person.cpf:
                cpf = self._clean_cpf(str(person.cpf))
            
            if cpf and len(cpf) == 11:
                try:
                    # Busca por CPF
                    params = {"cpf": cpf, "pagina": 1}
                    response = requests.get(base_url, headers=headers, params=params, timeout=10)
                    
                    if response.status_code == 200:
                        servants = response.json()
                        for servant_data in servants:
                            enriched = self._enrich_with_servant_data(person, servant_data)
                            if enriched:
                                results.append(enriched)
                    elif response.status_code == 404:
                        Logger.info(
                            self.sketch_id,
                            {"message": f"CPF {cpf} não encontrado como servidor público"}
                        )
                except Exception as e:
                    Logger.error(
                        self.sketch_id,
                        {"message": f"Erro buscando servidor por CPF {cpf}: {e}"}
                    )
            else:
                # Busca por nome
                search_name = person.full_name if person.full_name else f"{person.first_name} {person.last_name}"
                try:
                    params = {"nome": search_name, "pagina": 1}
                    response = requests.get(base_url, headers=headers, params=params, timeout=10)
                    
                    if response.status_code == 200:
                        servants = response.json()
                        for servant_data in servants:
                            enriched = self._enrich_with_servant_data(person, servant_data)
                            if enriched:
                                results.append(enriched)
                    elif response.status_code == 404:
                        Logger.info(
                            self.sketch_id,
                            {"message": f"Nome {search_name} não encontrado como servidor público"}
                        )
                except Exception as e:
                    Logger.error(
                        self.sketch_id,
                        {"message": f"Erro buscando servidor por nome {search_name}: {e}"}
                    )

        return results

    def _enrich_with_servant_data(self, person: Individual, servant_data: Dict[str, Any]) -> Optional[Individual]:
        """Enriquece Individual com dados de servidor público."""
        try:
            # Cria cópia do indivíduo com dados enriquecidos
            person_dict = person.model_dump()
            
            # Informações básicas
            person_dict["full_name"] = servant_data.get("nome", person_dict.get("full_name"))
            person_dict["cpf"] = servant_data.get("cpf")
            
            # Informações profissionais
            person_dict["occupation"] = servant_data.get("descricaoCargoEmprego")
            person_dict["organization_name"] = servant_data.get("orgaoLotacaoExercicio")
            person_dict["organization_code"] = servant_data.get("codigoOrgaoLotacaoExercicio")
            person_dict["upag_lotacao"] = servant_data.get("upagLotacaoExercicio")
            person_dict["work_location"] = servant_data.get("orgaoLocalExercicio")
            
            # Cargo e função
            person_dict["job_role"] = servant_data.get("funcao")
            person_dict["job_code"] = servant_data.get("codigoCargoEmprego")
            person_dict["job_class"] = servant_data.get("classeCargoEmprego")
            person_dict["job_reference"] = servant_data.get("referenciaCargoEmprego")
            person_dict["job_standard"] = servant_data.get("padraoCargoEmprego")
            person_dict["job_level"] = servant_data.get("nivelCargoEmprego")
            
            # Regime de trabalho
            person_dict["employment_regime"] = servant_data.get("tipoServidor")
            person_dict["employment_status"] = servant_data.get("situacaoVinculo")
            person_dict["work_schedule"] = servant_data.get("jornadaTrabalho")
            
            # Datas
            person_dict["admission_date"] = servant_data.get("dataIngressoCargoFuncao")
            person_dict["admission_public_service_date"] = servant_data.get("dataIngressoServicoPublico")
            person_dict["diploma_date"] = servant_data.get("dataDiploma")
            
            # Remuneração
            person_dict["base_salary"] = servant_data.get("remuneracaoBasicaBruta")
            person_dict["gratification"] = servant_data.get("gratificacao")
            person_dict["bonus"] = servant_data.get("funcao")
            person_dict["total_compensation"] = servant_data.get("remuneracaoAposDeducoes")
            
            # Escolaridade
            person_dict["education_level"] = servant_data.get("escolaridade")
            person_dict["education_area"] = servant_data.get("areaCurso")
            
            # Outras informações
            person_dict["is_public_servant"] = True
            person_dict["servant_type"] = servant_data.get("tipoServidor")
            person_dict["retirement_situation"] = servant_data.get("situacaoAposentadoria")
            
            return Individual(**person_dict)
            
        except Exception as e:
            Logger.error(
                self.sketch_id,
                {"message": f"Erro enriquecendo indivíduo com dados de servidor: {e}"}
            )
            return None
