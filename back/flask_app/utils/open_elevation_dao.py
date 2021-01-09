import requests
import json
from typing import Dict, List

class OpenElevationDao():

    def __init__(self, endpoint: str = 'http://localhost:8080'):
        self.endpoint = endpoint

    def get_elevation(self, lat: float, lng: float) -> int:
        response = requests.get(f'{self.endpoint}/api/v1/lookup?locations={lat},{lng}')
        if response.status_code == requests.codes.ok:
            return json.loads(response.text)["results"][0]["elevation"]
        return -1

    def bulk_get_elevation(self, locations: List[Dict[str, int]]) -> List[int]:
        locations = '|'.join([f'{coordinate["lat"]},{coordinate["lng"]}' for coordinate in locations])
        response = requests.get(f'{self.endpoint}/api/v1/lookup?locations={locations}')
        if response.status_code == requests.codes.ok:
            return [result["elevation"] for result in json.loads(response.text)["results"]]
        return [-1 for location in locations]