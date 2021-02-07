from mongoengine import Document
from mongoengine.fields import UUIDField, MultiPointField

class Route(Document):
    route_id = UUIDField(primary_key=True)
    locations = MultiPointField()
