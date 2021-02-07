import bcrypt
import base64
import hashlib

from uuid import uuid4
from ...models.user import User

class UserDao():
    def save_user(self, username: str, password: str):
        # handle long passwords
        uniform_len_pass = base64.b64encode(hashlib.sha256(password.encode()).digest())
        hashed_and_salted = bcrypt.hashpw(uniform_len_pass, bcrypt.gensalt())
        return User(id=str(uuid4()), username=username, password=hashed_and_salted).save()

    def load_user_by_name(self, username: str) -> User:
        users = User.objects(username__exact=username)
        if len(users) > 1:
            raise Exception(f"More than one user found with username '{username}'")
        elif len(users) == 0:
            raise Exception(f"No user found with username '{username}'")
        return users[0]

    def load_user_by_id(self, id: str) -> User:
        users = User.objects(id__exact=id)
        if len(users) > 1:
            raise Exception(f"More than one user found with id '{id}'")
        elif len(users) == 0:
            raise Exception(f"No user found with id '{id}'")
        return users[0]
