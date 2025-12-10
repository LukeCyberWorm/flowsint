import requests
from typing import List, Union
from flowsint_core.core.transform_base import Transform
from flowsint_types.ip import Ip
from flowsint_core.core.logger import Logger


class IPToGeolocationTransform(Transform):
    """[DeepFind] Get geolocation and ISP information for IP addresses."""

    InputType = Ip
    OutputType = Ip

    @classmethod
    def name(cls) -> str:
        return "ip_to_geolocation"

    @classmethod
    def category(cls) -> str:
        return "IP"

    @classmethod
    def key(cls) -> str:
        return "address"

    def preprocess(self, data: Union[List[str], List[dict], List[Ip]]) -> List[Ip]:
        if not isinstance(data, list):
            raise ValueError(f"Expected list input, got {type(data).__name__}")
        
        cleaned: List[Ip] = []
        for item in data:
            if isinstance(item, str):
                cleaned.append(Ip(address=item.strip()))
            elif isinstance(item, dict) and item.get("address"):
                cleaned.append(Ip(**item))
            elif isinstance(item, Ip):
                cleaned.append(item)
        
        return cleaned

    async def scan(self, data: List[InputType]) -> List[OutputType]:
        api_key = self.get_secret("DEEPFIND_API_KEY")
        if not api_key:
            Logger.warn(
                self.sketch_id,
                {"message": "DEEPFIND_API_KEY not found in Vault. Skipping IP geolocation."}
            )
            return []

        results: List[OutputType] = []
        
        for ip_obj in data:
            try:
                url = f"https://deepfind.me/api/geolocation/{ip_obj.address}"
                headers = {
                    "Authorization": f"Bearer {api_key}"
                }
                
                response = requests.get(url, headers=headers, timeout=30)
                
                if response.status_code == 200:
                    geo_data = response.json()
                    
                    if geo_data.get("status") == "success":
                        enriched_ip = Ip(
                            address=ip_obj.address,
                            country=geo_data.get("country"),
                            country_code=geo_data.get("countryCode"),
                            region=geo_data.get("regionName"),
                            city=geo_data.get("city"),
                            zip_code=geo_data.get("zip"),
                            latitude=geo_data.get("lat"),
                            longitude=geo_data.get("lon"),
                            timezone=geo_data.get("timezone"),
                            isp=geo_data.get("isp"),
                            organization=geo_data.get("org"),
                            asn=geo_data.get("as")
                        )
                        results.append(enriched_ip)
                        
                        Logger.info(
                            self.sketch_id,
                            {"message": f"Geolocated {ip_obj.address}: {geo_data.get('city')}, {geo_data.get('country')}"}
                        )
                    else:
                        Logger.error(
                            self.sketch_id,
                            {"message": f"Failed to geolocate {ip_obj.address}"}
                        )
                else:
                    Logger.error(
                        self.sketch_id,
                        {"message": f"Error geolocating {ip_obj.address}: HTTP {response.status_code}"}
                    )
                    
            except Exception as e:
                Logger.error(
                    self.sketch_id,
                    {"message": f"Error geolocating {ip_obj.address}: {e}"}
                )
        
        return results
