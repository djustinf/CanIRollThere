from mongoengine import Document
from mongoengine.fields import StringField, BinaryField

class User(Document):
    id = StringField(primary_key=True)
    username = StringField(unique=True)
    password = BinaryField()

    # Strange init requried to make mongoengine and flask-jwt play nice
    def __init__(self, id=None, username=None, password=None, *args, **kwargs):
        super(User, self).__init__(*args, **kwargs)
        self.id = id
        self.username = username
        self.password = password

    def __str__(self):
        return "User(id='%s')" % self.id
