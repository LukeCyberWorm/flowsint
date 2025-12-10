import requests
from typing import List, Union
from flowsint_core.core.transform_base import Transform
from flowsint_types.social_account import SocialAccount
from flowsint_types.username import Username
from flowsint_core.core.logger import Logger


class UsernameSearchTransform(Transform):
    """[DeepFind] Search username across 350+ platforms."""

    InputType = str
    OutputType = SocialAccount

    @classmethod
    def name(cls) -> str:
        return "username_to_social"

    @classmethod
    def category(cls) -> str:
        return "Social"

    @classmethod
    def key(cls) -> str:
        return "username"

    def preprocess(self, data: Union[List[str], List[dict]]) -> List[str]:
        if not isinstance(data, list):
            raise ValueError(f"Expected list input, got {type(data).__name__}")
        
        cleaned: List[str] = []
        for item in data:
            if isinstance(item, str):
                cleaned.append(item.strip())
            elif isinstance(item, dict) and item.get("username"):
                cleaned.append(item["username"].strip())
        
        return cleaned

    async def scan(self, data: List[str]) -> List[OutputType]:
        api_key = self.get_secret("DEEPFIND_API_KEY")
        if not api_key:
            Logger.warn(
                self.sketch_id,
                {"message": "DEEPFIND_API_KEY not found in Vault. Skipping username search."}
            )
            return []

        results: List[OutputType] = []
        
        for username in data:
            try:
                # First, try the comprehensive analyzer endpoint
                url = f"https://deepfind.me/api/analyzer/{username}"
                headers = {
                    "Authorization": f"Bearer {api_key}"
                }
                
                response = requests.get(url, headers=headers, timeout=60)
                
                if response.status_code == 200:
                    analyzer_data = response.json()
                    sites = analyzer_data.get("sites", [])
                    
                    for site in sites:
                        if site.get("status") == "found":
                            social_account = SocialAccount(
                                username=Username(value=site.get("username_claimed") or username),
                                platform=site.get("site_name"),
                                profile_url=site.get("site_url_user"),
                                status="found",
                                http_status=site.get("http_status")
                            )
                            results.append(social_account)
                    
                    summary = analyzer_data.get("summary", {})
                    profiles_found = summary.get("profiles_found", 0)
                    total_checked = summary.get("total_sites_checked", 0)
                    
                    Logger.info(
                        self.sketch_id,
                        {"message": f"Found {profiles_found} profiles for '{username}' across {total_checked} sites"}
                    )
                else:
                    Logger.error(
                        self.sketch_id,
                        {"message": f"Error searching username '{username}': HTTP {response.status_code}"}
                    )
                    
            except Exception as e:
                Logger.error(
                    self.sketch_id,
                    {"message": f"Error searching username '{username}': {e}"}
                )
        
        return results
