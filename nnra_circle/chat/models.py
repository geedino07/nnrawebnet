from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Q

# Create your models here.

class ThreadManager(models.Manager):
    def by_user(self, user):
        lookup_one = Q(user_one=user) | Q(user_two=user)
        lookup_two = Q(user_one=user) & Q(user_two=user)
        qs = self.get_queryset().filter(lookup_one).exclude(lookup_two).distinct()
        return qs
class Thread(models.Model):
    user_one = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False, blank=False, related_name='user_thread_one')
    user_two = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False, blank=False, related_name='user_thread_two')

    objects = models.Manager()
    theadm = ThreadManager()
class ChatMessage(models.Model):
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, null=False, blank=False)
    message = models.TextField()
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

