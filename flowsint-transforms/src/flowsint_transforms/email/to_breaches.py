import requests
from typing import List
from flowsint_core.core.transform_base import Transform
from flowsint_types.email import Email
from flowsint_core.core.logger import Logger


class EmailToBreachesTransform(Transform):
    """[DeepFind] Check if email was exposed in data breaches."""

    InputType = Email
    OutputType = Email

    @classmethod
    def name(cls) -> str:
        return "email_to_breaches"

    @classmethod
    def category(cls) -> str:
        return "Email"

    @classmethod
    def key(cls) -> str:
        return "email"

    async def scan(self, data: List[InputType]) -> List[OutputType]:
        api_key = self.get_secret("DEEPFIND_API_KEY")
        if not api_key:
            Logger.warn(
                self.sketch_id,
                {"message": "DEEPFIND_API_KEY not found in Vault. Skipping email breach check."}
            )
            return []

        results: List[OutputType] = []
        
        for email_obj in data:
            try:
                url = f"https://deepfind.me/api/data-breach-scanner/check-email"
                headers = {
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                }
                
                response = requests.post(url, json={"email": email_obj.email}, headers=headers, timeout=30)
                
                if response.status_code == 200:
                    breach_data = response.json()
                    
                    if breach_data.get("isBreached"):
                        breaches = breach_data.get("breaches", [])
                        
                        # Extract breach information
                        breach_list = []
                        for breach in breaches:
                            breach_info = {
                                "name": breach.get("Name"),
                                "title": breach.get("Title"),
                                "domain": breach.get("Domain"),
                                "breach_date": breach.get("BreachDate"),
                                "pwn_count": breach.get("PwnCount"),
                                "description": breach.get("Description"),
                                "data_classes": breach.get("DataClasses", []),
                                "is_verified": breach.get("IsVerified"),
                                "is_sensitive": breach.get("IsSensitive"),
                            }
                            breach_list.append(breach_info)
                        
                        enriched_email = Email(
                            email=email_obj.email,
                            breaches=breach_list,
                            breach_count=len(breach_list)
                        )
                        results.append(enriched_email)
                        
                        Logger.info(
                            self.sketch_id,
                            {"message": f"Found {len(breach_list)} breaches for {email_obj.email}"}
                        )
                    else:
                        Logger.info(
                            self.sketch_id,
                            {"message": f"No breaches found for {email_obj.email}"}
                        )
                elif response.status_code == 404:
                    Logger.info(
                        self.sketch_id,
                        {"message": f"No breaches found for {email_obj.email}"}
                    )
                else:
                    Logger.error(
                        self.sketch_id,
                        {"message": f"Error checking breaches for {email_obj.email}: HTTP {response.status_code}"}
                    )
                    
            except Exception as e:
                Logger.error(
                    self.sketch_id,
                    {"message": f"Error checking breaches for {email_obj.email}: {e}"}
                )
        
        return results
