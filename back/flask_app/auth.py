import bcrypt
import base64
import hashlib

from .daos.mongo.user_dao import UserDao
from .models.user import User

userDao = UserDao()

def authenticate(username: str, password: str) -> User:
    user = userDao.load_user_by_name(username)
    uniform_len_pass = base64.b64encode(hashlib.sha256(password.encode()).digest())
    if user and bcrypt.checkpw(uniform_len_pass, user.password):
        return user

def identity(payload) -> User:
    user_id = payload['identity']
    return userDao.load_user_by_id(user_id)
