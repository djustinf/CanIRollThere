import logging

from typing import List, Tuple
from uuid import uuid4
from ...models.route import Route

class RouteDao():
    def save_route(self, locations: List[Tuple[float, float]]):
        return Route(route_id=uuid4(), locations=locations).save()

    def load_route(self, route_id: str) -> Route:
        routes = Route.objects(route_id__exact=route_id)
        if len(routes) > 1:
            raise Exception(f"More than one route found with route id '{route_id}'")
        elif len(routes) == 0:
            raise Exception(f"No routes founds with route id '{route_id}'")
        return routes[0]
