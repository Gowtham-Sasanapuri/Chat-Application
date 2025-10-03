from django.urls import re_path,path
from . import consumers,userconsumer

websocket_urls = [
    re_path(r"ws/chat/(?P<room_name>[^/]+)/$",consumers.Consumers.as_asgi()),
    re_path(r"ws/chat/user/(?P<room_name>[^/]+)/$",userconsumer.Updating_user.as_asgi())
]