from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import ChatMessage, Thread

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    receiver = UserSerializer()
    class Meta:
        model = ChatMessage
        fields = '__all__'
    
class ThreadSerializer(serializers.ModelSerializer):
    user_one = UserSerializer()
    user_two = UserSerializer()
    last_message = serializers.SerializerMethodField()
    class Meta:
        model = Thread
        fields = [
            'user_one',
            'user_two',
            'last_message',
        ]

    
    def get_last_message(self, obj):
        return ChatMessage.objects.filter(thread__id=obj.id).order_by('-created').first()