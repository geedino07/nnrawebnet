from rest_framework import serializers
from accounts.serializers import UserSerializer, UserProfileSerializer
from .models import ChatMessage, Thread

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    receiver = UserSerializer()
    class Meta:
        model = ChatMessage
        fields = '__all__'
    
class ThreadSerializer(serializers.ModelSerializer):
    user_one = UserProfileSerializer()
    user_two = UserProfileSerializer()
    last_message = serializers.SerializerMethodField()
    class Meta:
        model = Thread
        fields = [
            'user_one',
            'user_two',
            'last_message',            
        ]

    
    def get_last_message(self, obj):
        last_message = ChatMessage.objects.filter(thread__id=obj.id).order_by('-created').first()
        serializer = ChatMessageSerializer(last_message) if last_message else None
        return serializer.data if serializer else None