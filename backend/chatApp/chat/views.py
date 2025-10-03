from django.shortcuts import render
from django.http import HttpResponse,JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Q
from .models import Users,Messages
from .serializer import Users_Serializer,Messages_Serializer
import jwt
from django.conf import settings
import datetime

SECRET_KEY = settings.SECRET_KEY

def token_decoder(token):
    try:
        payload = jwt.decode(token,SECRET_KEY,algorithms = ["HS256"])
    except jwt.ExpiredSignatureError:
        return False
    except jwt.InvalidTokenError:
        return False
    return payload 

@api_view(["POST"])
def fetching_messages(request):
    token = request.data.get("token")
    req_user_id = request.data.get("r_id")
    payload = token_decoder(token)
    user_id = payload.get("user_id")
    
    try:
        msg_obj = Messages.objects.filter(
            Q(sender=user_id, receiver=req_user_id) |
            Q(sender=req_user_id, receiver=user_id)
            ).order_by("timestamp")   
    except Messages.DoesNotExist:
        return Response({"messages":"you haven't messaged yet","success":False})
    Messages.objects.filter(receiver=user_id, sender=req_user_id, seen=False).update(seen=True)
    msg_serializer = Messages_Serializer(msg_obj,many = True)
    return Response({"message":"You are already friends","msg":msg_serializer.data,"success":True})

@api_view(["POST"])
def search_user(request):
    search_term = request.data.get("user","").strip()
    token = request.data.get("token",None)
    unseen_msg = Messages.objects.none() 
    if search_term == "" and token:
        payload = token_decoder(token)
        user_id = payload.get("user_id")
        sent_user_id = Messages.objects.filter(sender = user_id).values_list("receiver",flat=True)
        received_user_id = Messages.objects.filter(receiver = user_id).values_list("sender",flat=True)
        unseen_msg = Messages.objects.filter(receiver = user_id,sender_id__in = received_user_id,seen = False).values_list("sender",flat=True)
        other_user_id = set(sent_user_id) | set(received_user_id)
        user_obj = Users.objects.filter(id__in = other_user_id)
    else:
        user_obj = Users.objects.filter(Q(username = search_term) | Q(phone_number = search_term))
    if user_obj.exists():
        serialized = Users_Serializer(user_obj,many=True)
        return Response({"message":"user found","user":serialized.data,"unseen" : unseen_msg,"success":True})
    else:
        return Response({"message":"user not found","success":True})

@api_view(["POST"])
def register(request):
    phone_number = request.data.get("phone_number")
    if Users.objects.filter(phone_number=phone_number).exists():
        return Response({"message": "User already exists", "success": False})
    serializer = Users_Serializer(data = request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message":"Successfully Registered","success":True})
    return Response({"message":serializer.errors,"success":False})

@api_view(["POST"])
def login(request):
    token = request.data.get("token",None)
    if token:
        payload = token_decoder(token)
        if not payload:
            return Response({"message": "Invalid or expired token", "success": False})
        user_id = payload.get("user_id")
        phone_number = payload.get("phone_number")
        try:
            user = Users.objects.get(id = user_id,phone_number = phone_number)
        except Users.DoesNotExist:
            return Response({"message":"user not found","success":False})
        return Response({"message" : "successfully Logged in","success":True})
    
    phone_number = request.data.get("phone_number")
    password = request.data.get("password")
    try:
        user = Users.objects.get(phone_number = phone_number,password = password)
    except Users.DoesNotExist:
        return Response({"message":"user not found","success":False})
    payload = {
        "user_id" : user.id,
        "phone_number" : phone_number,
        "exp" : datetime.datetime.utcnow() + datetime.timedelta(days = 2),
        "iat" : datetime.datetime.utcnow()
        }
    jwt_token = jwt.encode(payload,SECRET_KEY,algorithm="HS256")
    return Response({"message":"successfully logged in",
                        "phone_number" : phone_number,
                        "jwt_token":jwt_token,
                        "success":True})
       

def users_list(request):
    users = Users.objects.all()
    return render(request,"users.html",context={"data":users})

# views.py
from django.http import JsonResponse
from .models import Users, Messages

def add_fake_messages(request):
    # Replace these with actual registered phone numbers
    sender_phone = "9491157536"      # 👉 change this
    receiver_phone = "7396884084"    # 👉 change this

    try:
        sender = Users.objects.get(phone_number=sender_phone)
        receiver = Users.objects.get(phone_number=receiver_phone)

        Messages.objects.create(sender=sender, receiver=receiver, message="Hey, how are you?")
        Messages.objects.create(sender=receiver, receiver=sender, message="I'm good! You?")

        return JsonResponse({"message": "Fake messages added successfully", "success": True})
    except Users.DoesNotExist:
        return JsonResponse({"message": "One or both users not found", "success": False})


def home(request):
    return HttpResponse("Hello django")
# Create your views here.
