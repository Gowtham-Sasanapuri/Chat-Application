from .models import Users,Messages
from rest_framework import serializers

class Users_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = "__all__"

class Messages_Serializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    receiver_id = serializers.IntegerField(source='receiver.id', read_only=True)
    class Meta:
        model = Messages
        fields =  ['id', 'message', 'sender_id', 'receiver_id', 'seen', 'timestamp']