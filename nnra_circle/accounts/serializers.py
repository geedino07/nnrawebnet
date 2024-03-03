from rest_framework import serializers
from .models import Profile, Office, Department
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class OfficeSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer()
    class Meta:
        model = Office
        fields= '__all__'

class ProfileSerializer(serializers.ModelSerializer):
    office = OfficeSerializer()
    user= UserSerializer()
    class Meta: 
        model = Profile
        fields = '__all__'
    
class ProfileModSerializer(serializers.ModelSerializer):
    office = OfficeSerializer()
    class Meta: 
        model = Profile
        fields = '__all__'
    
    
class UserProfileSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = [
            'email',
            'first_name',
            'id', 
            'is_active',
            'date_joined',
            'last_name',
            'username',
            'profile'
        ]
    
    def get_profile(self, obj):
        try:
            profile = Profile.objects.get(user__id=obj.id)
        except Profile.DoesNotExist:
            profile = None
        
        serializer = ProfileModSerializer(profile) if profile else None
        return serializer.data if serializer else None