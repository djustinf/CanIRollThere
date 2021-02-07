import json

from flask import Flask, request, send_from_directory, abort
from jsonschema import validate
from jsonschema.exceptions import ValidationError
from uuid import uuid4

from .utils.open_elevation_dao import OpenElevationDao
from .utils.mongodb_dao import Route, MongoDBDao

app = Flask(__name__)
open_elevation_dao = OpenElevationDao('http://localhost:8080')
mongodb_dao = MongoDBDao()

@app.route('/')
def index():
    return send_from_directory('web', 'index.html')

@app.route('/<path:static_asset>')
def serve_static(static_asset):
    return send_from_directory('web', static_asset)

@app.route('/elevation', methods = ['GET'])
def elevation() -> str:
    lat, lng = request.args.get('lat'), request.args.get('lng')
    if lat and lng:
        return json.dumps(open_elevation_dao.get_elevation(lat, lng))
    return "-1"

route_schema = {
    "type": "object",
    "properties": {
        "locations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "lat": { "type": "number" },
                    "lng": { "type": "number" }
                },
                "required": ["lat", "lng"]
            },
            "minItems": 1
        }
    },
    "required": ["locations"]
}
@app.route('/elevation', methods = ['POST'])
def bulk_elevation() -> str:
    request_data = json.loads(request.get_data())
    try:
        validate(request_data, route_schema)
    except ValidationError as e:
        return str(e), 400
    return json.dumps(open_elevation_dao.bulk_get_elevation(request_data["locations"]))

@app.route('/load', methods = ['GET'])
def load() -> str:
    route_id = request.args.get('id')
    if route_id:
        try:
            route = mongodb_dao.load_route(route_id)
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

@app.route('/save', methods = ['POST'])
def save():
    request_data = json.loads(request.get_data())
    try:
        validate(request_data, route_schema)
    except ValidationError as e:
        return str(e), 400
    locations = [[location["lat"], location["lng"]] for location in request_data["locations"]]
    route = mongodb_dao.save_route(locations)
    return json.dumps({
        "route_id": str(route.route_id)
    }), 200