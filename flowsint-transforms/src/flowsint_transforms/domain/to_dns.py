import requests
from typing import List, Dict, Any, Union
from flowsint_core.core.transform_base import Transform
from flowsint_types.domain import Domain
from flowsint_core.core.logger import Logger


class DomainToDNSTransform(Transform):
    """[DeepFind] Get DNS records (A, AAAA, MX, NS, TXT, SOA) for a domain."""

    InputType = Domain
    OutputType = Domain

    @classmethod
    def name(cls) -> str:
        return "domain_to_dns"

    @classmethod
    def category(cls) -> str:
        return "Domain"

    @classmethod
    def key(cls) -> str:
        return "domain"

    def preprocess(self, data: Union[List[str], List[dict], List[Domain]]) -> List[Domain]:
        if not isinstance(data, list):
            raise ValueError(f"Expected list input, got {type(data).__name__}")
        
        cleaned: List[Domain] = []
        for item in data:
            if isinstance(item, str):
                cleaned.append(Domain(domain=item.strip()))
            elif isinstance(item, dict) and item.get("domain"):
                cleaned.append(Domain(**item))
            elif isinstance(item, Domain):
                cleaned.append(item)
        
        return cleaned

    async def scan(self, data: List[InputType]) -> List[OutputType]:
        api_key = self.get_secret("DEEPFIND_API_KEY")
        if not api_key:
            Logger.warn(
                self.sketch_id,
                {"message": "DEEPFIND_API_KEY not found in Vault. Skipping DNS lookup."}
            )
            return []

        results: List[OutputType] = []
        
        for domain_obj in data:
            try:
                url = f"https://deepfind.me/api/dns-lookup"
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
                
                response = requests.post(url, json={"domain": domain_obj.domain}, headers=headers, timeout=30)
                
                if response.status_code == 200:
                    dns_data = response.json()
                    records = dns_data.get("records", [])
                    
                    # Organize records by type
                    dns_records = {}
                    for record in records:
                        record_type = record.get("recordType")
                        value = record.get("value")
                        
                        if record_type not in dns_records:
                            dns_records[record_type] = []
                        dns_records[record_type].append(value)
                    
                    enriched_domain = Domain(
                        domain=domain_obj.domain,
                        dns_records=dns_records
                    )
                    results.append(enriched_domain)
                    
                    Logger.info(
                        self.sketch_id,
                        {"message": f"Retrieved {len(records)} DNS records for {domain_obj.domain}"}
                    )
                else:
                    Logger.error(
                        self.sketch_id,
                        {"message": f"Error getting DNS for {domain_obj.domain}: HTTP {response.status_code}"}
                    )
                    
            except Exception as e:
                Logger.error(
                    self.sketch_id,
                    {"message": f"Error getting DNS for {domain_obj.domain}: {e}"}
                )
        
        return results
