import json

from flask import Blueprint, request
from jsonschema import validate
from jsonschema.exceptions import ValidationError
from .api_schemas import route_schema
from ..daos.open_elevation_dao import OpenElevationDao

elevation_api = Blueprint('elevation', __name__)

open_elevation_dao = OpenElevationDao('http://localhost:8080')

@elevation_api.route('/', methods = ['GET'])
def elevation() -> str:
    lat, lng = request.args.get('lat'), request.args.get('lng')
    if lat and lng:
        return json.dumps(open_elevation_dao.get_elevation(lat, lng))
    return "-1"

@elevation_api.route('/', methods = ['POST'])
def bulk_elevation() -> str:
    request_data = json.loads(request.get_data())
    try:
        validate(request_data, route_schema)
    except ValidationError as e:
        return str(e), 400
    return json.dumps(open_elevation_dao.bulk_get_elevation(request_data["locations"]))
