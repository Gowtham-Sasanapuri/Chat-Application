from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json

class Updating_user(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]

        await self.channel_layer.group_add(self.room_name,self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_name,self.channel_name)
    
    @database_sync_to_async
    def get_users(self,cur_id):
        from .models import Users,Messages
        from .serializer import Users_Serializer,Messages_Serializer

        sent_user_id = Messages.objects.filter(sender = cur_id).values_list("receiver",flat=True)
        received_user_id = Messages.objects.filter(receiver = cur_id).values_list("sender",flat=True)
        other_user_id = set(sent_user_id) | set(received_user_id)
        user_obj = Users.objects.filter(id__in = other_user_id)
        unseen_msg = list(Messages.objects.filter(receiver = cur_id,sender_id__in = received_user_id,seen = False).values_list("sender",flat=True))
        serialized = Users_Serializer(user_obj,many=True)
        return serialized.data,unseen_msg
        
    
    async def receive(self, text_data=None, bytes_data=None):
        json_return = json.loads(text_data)
        user_id = json_return.get("cur_user_id")

        # users = await self.get_users(user_id)

        await self.channel_layer.group_send(self.room_name,{
            "type":"send_user",
            "cur_id" : user_id
        })

    async def send_user(self,event):
        cur_id = event["cur_id"]
        users,unseen = await self.get_users(cur_id)

        await self.send(text_data=json.dumps({"users" : users,"message":"users sent successfully","unseen_id" : unseen,"success":True}))
