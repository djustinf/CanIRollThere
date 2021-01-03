from flask import Flask, request, send_from_directory
import requests
import json

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('web', 'index.html')

@app.route('/<path:static_asset>')
def serve_static(static_asset):
    return send_from_directory('web', static_asset)

@app.route('/elevation')
def elevation() -> str:
    lat, lon = request.args.get('lat'), request.args.get('lon')
    if lat and lon:
        response = requests.get(f'http://localhost:8080/api/v1/lookup?locations={lat},{lon}')
        if response.status_code == requests.codes.ok:
            oe_response: Dict[str, List[Dict[str, Any]]] = json.loads(response.text)
            return str(oe_response["results"][0]["elevation"])
    return "-1"