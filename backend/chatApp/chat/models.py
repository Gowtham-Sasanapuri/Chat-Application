from django.db import models
from django.core.validators import RegexValidator

phone_validator = RegexValidator(
    regex=r'^\+?1?\d{9,15}$',
    message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
)

class Users(models.Model):
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=30)
    phone_number = models.CharField(max_length=15,validators=[phone_validator],unique=True)

class Messages(models.Model):
    sender = models.ForeignKey(to=Users,on_delete=models.CASCADE,related_name="sender_msg")
    receiver = models.ForeignKey(to=Users,on_delete=models.CASCADE,related_name="receiver_msg")
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    seen = models.BooleanField(default=False)