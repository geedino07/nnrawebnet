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