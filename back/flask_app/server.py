import json

from flask import Flask, request, send_from_directory, abort
from flask_jwt import JWT, jwt_required, current_identity
from mongoengine import connect

from .models.route import Route
from .auth import authenticate, identity

from .apis.elevation_api import elevation_api
from .apis.route_api import route_api
from .apis.user_api import user_api

# Init Flask app
app = Flask(__name__)
app.register_blueprint(elevation_api, url_prefix='/elevation')
app.register_blueprint(route_api, url_prefix='/route')
app.register_blueprint(user_api, url_prefix='/user')
connect('canirollthere')

# TODO: Replace with actual secret management
app.secret_key = 'foo_secret'
jwt = JWT(app, authenticate, identity)

@app.route('/')
def index():
    return send_from_directory('web', 'index.html')

@app.route('/<path:static_asset>')
def serve_static(static_asset):
    return send_from_directory('web', static_asset)
