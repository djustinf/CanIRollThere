import json

from flask import Blueprint, request
from jsonschema import validate
from jsonschema.exceptions import ValidationError
from .api_schemas import route_schema
from ..daos.mongo.route_dao import RouteDao

route_api = Blueprint('route', __name__)

route_dao = RouteDao()

@route_api.route('/load', methods = ['GET'])
def load() -> str:
    route_id = request.args.get('id')
    if route_id:
        try:
            route = route_dao.load_route(route_id)
        except Exception as e:
            return str(e), 400
        return json.dumps({
            "route_id": str(route.route_id),
            "locations": [
                {
                    "lat": lat,
                    "lng": lng
                } for lat, lng in route.locations['coordinates']
            ]
        }), 200
    return json.dumps({}), 400

@route_api.route('/save', methods = ['POST'])
def save():
    request_data = json.loads(request.get_data())
    try:
        validate(request_data, route_schema)
    except ValidationError as e:
        return str(e), 400
    locations = [[location["lat"], location["lng"]] for location in request_data["locations"]]
    route = route_dao.save_route(locations)
    return json.dumps({
        "route_id": str(route.route_id)
    }), 200
