from django.db import models
from django.conf import settings

# Create your models here.

class Department(models.Model):
    dept_name = models.CharField(null=False, blank=False, max_length=255)

class Profile(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False, blank=False)
    dept = models.ForeignKey(Department, null=True, on_delete= models.SET_NULL)
    profileImg= models.ImageField(upload_to='users/%Y/%M/%d', default='def-user-img.png')
    phone = models.CharField(max_length=11)
    is_online = models.BooleanField(default=False)
    joined = models.DateTimeField(auto_now_add=True)
    updated= models.DateTimeField(auto_now=True)

class Otpcode(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False)
    code = models.CharField(max_length=6, unique=True)
    created = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)
