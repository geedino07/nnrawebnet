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
    

    def get_or_new(self, user, other_userId):
        userId = user.id
        if userId == other_userId:
            return None, False
        
        qlookup_one = Q(user_one__id=userId) & Q(user_two__id=other_userId)
        qlookup_two = Q(user_one__id=other_userId) & Q(user_two__id=userId)
        query_set = self.get_queryset().filter(qlookup_one | qlookup_two).distinct()
        
        if query_set.count == 1:
            return query_set.first(), False
        elif query_set.count() > 1:
            return query_set.order_by('created').first(), False
        else:
            other_user = User.objects.get(id=other_userId)
            if user != other_user:
                obj = self.model(
                    user_one=user,
                    user_two = other_user
                )
                obj.save()
                return obj, True
            return None, False

class Thread(models.Model):
    user_one = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False, blank=False, related_name='user_thread_one')
    user_two = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False, blank=False, related_name='user_thread_two')
    created = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()
    theadm = ThreadManager()

    
    @property
    def room_group_name(self):
        return f'chat_{self.id}'
class ChatMessage(models.Model):
    # thread = models.ForeignKey(Thread, on_delete=models.CASCADE, null=False, blank=False)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False, blank=False, related_name='sender')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False, blank=False, related_name='receiver')
    message = models.TextField()
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']
        

