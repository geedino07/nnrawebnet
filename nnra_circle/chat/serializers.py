from rest_framework import serializers
from accounts.serializers import UserSerializer
from .models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    receiver = UserSerializer()
    class Meta:
        model = ChatMessage
        fields = '__all__'