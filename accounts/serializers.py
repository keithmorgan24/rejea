from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    # Pulling username and email from the linked User model
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'username', 
            'email', 
            'phone_number', 
            'user_type', 
            'is_verified', 
            'id_number', 
            'license_number', 
            'license_image',
            'profile_photo'
        ]
        # Security: Prevent users from verifying themselves via the API
        read_only_fields = ['is_verified', 'user_type']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'email']

    def create(self, validated_data):
        # Using create_user ensures the password is encrypted (hashed)
        user = User.objects.create_user(**validated_data)
        return user
class DriverProfileSerializer(serializers.ModelSerializer):
    # We pull the username from the related User model so the frontend can display it
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'username', 
            'email', 
            'phone_number', 
            'id_number', 
            'license_number', 
            'license_image', 
            'profile_photo', 
            'is_verified',
            'is_driver'
        ]
        # These shouldn't be editable by the driver directly for security
        read_only_fields = ['is_verified']

    def update(self, instance, validated_data):
        # This handles the logic if you need to do something specific 
        # when a driver updates their license (like resetting is_verified to False)
        instance.is_verified = False 
        return super().update(instance, validated_data)

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    is_driver = serializers.BooleanField(source='user.is_driver', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'password', 'phone_number', 'user_type', 'id_number', 'license_number', 'is_driver']
