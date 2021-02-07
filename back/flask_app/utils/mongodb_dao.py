from typing import List, Tuple
from mongoengine import connect, Document
from mongoengine.fields import UUIDField, MultiPointField
from uuid import uuid4
import logging

class Route(Document):
    route_id = UUIDField(primary_key=True)
    locations = MultiPointField()

class MongoDBDao():
    def __init__(self):
        connect('canirollthere')

    def save_route(self, locations: List[Tuple[float, float]]):
        return Route(route_id=uuid4(), locations=locations).save()

    def load_route(self, route_id: str) -> Route:
        routes = Route.objects(route_id__exact=route_id)
        if len(routes) > 1:
            raise Exception(f"More than one route found with route id '{route_id}'")
        elif len(routes) == 0:
            raise Exception(f"No routes founds with route id '{route_id}'")
        return routes[0]