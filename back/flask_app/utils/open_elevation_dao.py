import requests
import json
from typing import Dict, List

class OpenElevationDao():
    CHUNK_SIZE = 50  # ~ 1024 / (length of each coordinate pair + 1 for '|')

    def __init__(self, endpoint: str = 'http://localhost:8080'):
        self.endpoint = endpoint

    def get_elevation(self, lat: float, lng: float) -> int:
        response = requests.get(f'{self.endpoint}/api/v1/lookup?locations={lat},{lng}')
        if response.status_code == requests.codes.ok:
            return json.loads(response.text)["results"][0]["elevation"]
        return -1

    def bulk_get_elevation(self, locations: List[Dict[str, float]]) -> List[int]:
        elevations = []
        for i in range(len(locations) // self.CHUNK_SIZE + 1):
            current_pos = i * self.CHUNK_SIZE
            locations_chunk = locations[current_pos: min(len(locations), current_pos + self.CHUNK_SIZE)]
            coordinate_pairs = '|'.join([
                self._round_and_stringify(coordinate["lat"], coordinate["lng"])
                for coordinate in locations_chunk
            ])
            response = requests.get(f'{self.endpoint}/api/v1/lookup?locations={coordinate_pairs}')
            if response.status_code == requests.codes.ok:
                elevations += [result["elevation"] for result in json.loads(response.text)["results"]]
                continue
            return [-1 for location in locations]
        return elevations

    @staticmethod
    def _round_and_stringify(lat: float, lng: float):
        return '{:.5f},{:.5f}'.format(lat, lng)