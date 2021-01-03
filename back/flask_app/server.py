from flask import Flask, request, send_from_directory
from random import randint

app = Flask(__name__)

@app.route('/')
def index():
    return send_from_directory('web', 'index.html')

@app.route('/<path:static_asset>')
def serve_static(static_asset):
    return send_from_directory('web', static_asset)

@app.route('/elevation')
def elevation():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    print('lon: ' + lon)
    print('lat: ' + lat)
    return str(randint(1, 100))
