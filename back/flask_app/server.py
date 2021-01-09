import json

from flask import Flask, request, send_from_directory, abort
from jsonschema import validate
from jsonschema.exceptions import ValidationError

from .utils.open_elevation_dao import OpenElevationDao

app = Flask(__name__)
open_elevation_dao = OpenElevationDao('http://localhost:8080')

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

bulk_elevation_schema = {
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
            }
        }
    },
    "required": ["locations"]
}
@app.route('/elevation', methods = ['POST'])
def bulk_elevation() -> str:
    request_data = json.loads(request.get_data())
    try:
        validate(request_data, bulk_elevation_schema)
    except ValidationError as e:
        return str(e), 400
    return json.dumps(open_elevation_dao.bulk_get_elevation(request_data["locations"]))