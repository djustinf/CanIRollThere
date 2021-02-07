import json

from flask import Blueprint, request
from jsonschema import validate
from jsonschema.exceptions import ValidationError
from .api_schemas import user_schema
from ..daos.mongo.user_dao import UserDao

user_api = Blueprint('user', __name__)

user_dao = UserDao()

@user_api.route('/save', methods = ['POST'])
def save():
    request_data = json.loads(request.get_data())
    try:
        validate(request_data, user_schema)
    except ValidationError as e:
        return str(e), 400
    user = user_dao.save_user(request_data['username'], request_data['password'])
    return json.dumps({
        "id": str(user.id),
        "username": str(user.username),
    }), 200
