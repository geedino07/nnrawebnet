from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from django.db.models import Q

# Create your models here.

class ThreadManager(models.Manager):
    def by_user(self, user):
        """
        Get the threads related to User user
        """
        lookup_one = Q(user_one=user) | Q(user_two=user)
        lookup_two = Q(user_one=user) & Q(user_two=user)
        qs = self.get_queryset().filter(lookup_one).exclude(lookup_two).distinct()
        print(qs)
        return qs
    
    def get_thread(self, user_one_id, user_two_id):
        if user_one_id == user_two_id:
            return None
        
        qlookup_one = Q(user_one__id=user_one_id) & Q(user_two__id=user_two_id)
        qlookup_two = Q(user_one__id=user_two_id) & Q(user_two__id=user_two_id)
        query_set = self.get_queryset().filter(qlookup_one | qlookup_two).first()
        return query_set
    
  
    def get_or_new(self, user, other_userId):
        """
        gets or creates a new thread related to User user and user with an id of other_userId
        returns Thread (created or found thread object), Boolean(true if a new thread was created, false otherwise)
        """
        userId = user.id
        if userId == other_userId:
            return None, False
        
        qlookup_one = Q(user_one__id=userId) & Q(user_two__id=other_userId)
        qlookup_two = Q(user_one__id=other_userId) & Q(user_two__id=userId)
        query_set = self.get_queryset().filter(qlookup_one | qlookup_two).distinct()
        
        if query_set.count() == 1:
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

#a thread of messages between two users
class Thread(models.Model):
    user_one = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False, blank=False, related_name='user_thread_one')
    user_two = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False, blank=False, related_name='user_thread_two')
    created = models.DateTimeField(auto_now_add=True)

    objects = models.Manager()
    threadm = ThreadManager()

    @property
    def room_group_name(self):
        return f'chat_{self.id}'
    

class ChatManager(models.Manager):
    def create_chat(self, sender, receiverid, message, thread, commit=True):
        """
        creates a new ChatMessage instance and returns it 
        if commit = True, the created chat message is persisted to the database
        """
        if sender.id == receiverid:
            return None, 'Sender and receiver cannot be thesame'
        
        receiver = User.objects.filter(id=receiverid).first()
        if receiver is not None:
            obj = self.model(
                thread=thread,
                sender = sender,
                receiver = receiver,
                message = message
            )
            if commit: 
                obj.save()
            return obj, 'chat created'
        else:
            return None, 'Receiver was not found'
        

class ChatMessage(models.Model):
    thread = models.ForeignKey(Thread, on_delete=models.CASCADE, null=False, blank=False, related_name='msgthread')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False, blank=False, related_name='sender')
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=False, blank=False, related_name='receiver')
    message = models.TextField()
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)
    seen = models.BooleanField(default=False)

    objects = models.Manager()
    chatm = ChatManager()

    class Meta:
        ordering = ['-created']
        indexes =[
            models.Index(fields=['sender', 'receiver']),
            models.Index(fields=['-created'])
        ]

        

