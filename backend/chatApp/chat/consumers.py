from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import json

class Consumers(AsyncWebsocketConsumer):

    

    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]

        await self.channel_layer.group_add(self.room_name,self.channel_name)
        await self.accept()
    
    async def disconnect(self, code):
        return await self.channel_layer.group_discard(self.room_name,self.channel_name)
    
    @database_sync_to_async
    def store_in_database(self,msg,s_id,r_id):
        from .models import Users,Messages
        sender = Users.objects.get(id=s_id)
        receiver = Users.objects.get(id=r_id)
        Messages.objects.create(sender = sender,receiver = receiver,message = msg)
        Messages.objects.filter(receiver = sender,sender = receiver,seen = False).update(seen = True)
        return True

    async def receive(self,text_data):
        message_json = json.loads(text_data)
        message = message_json.get("message")
        sender_id = message_json.get("user_id")
        receiver_id = message_json.get("r_id")

        status = await self.store_in_database(message,sender_id,receiver_id)

        if status:
            await self.channel_layer.group_send(f"user_{receiver_id}",{
                "type" : "send_user",
                "cur_id" : receiver_id
            })

            await self.channel_layer.group_send(f"user_{sender_id}",{
                "type" : "send_user",
                "cur_id" : sender_id
            })

            await self.channel_layer.group_send(self.room_name,{
                "type" : "send_message",
                "message" : message,
                "s_id" : sender_id,
            })
            

    async def send_message(self,event):
        msg = event["message"]
        s_id = event["s_id"]
        await self.send(text_data=json.dumps({"message":msg,"s_id":s_id}))
