from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile

# Get the active User model (your custom accounts.User)
User = get_user_model()

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Standard profile view for passengers and general display.
    """
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'username', 'email', 'phone_number', 'user_type', 
            'is_verified', 'id_number', 'license_number', 
            'license_image', 'profile_photo'
        ]
        read_only_fields = ['is_verified', 'user_type']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    # Ensure these match what your React frontend sends in 'payload'
    user_type = serializers.CharField(write_only=True, default='passenger')
    phone_number = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'user_type', 'phone_number']

    def create(self, validated_data):
        user_type = validated_data.pop('user_type', 'passenger')
        phone_number = validated_data.pop('phone_number', "")

        # Create the main User account
        user = User.objects.create_user(**validated_data)

        # Create the Profile once here
        UserProfile.objects.create(
            user=user,
            user_type=user_type,
            phone_number=phone_number
        )
        return user


class DriverProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for drivers to update their verification documents.
    """
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'username', 'email', 'phone_number', 'id_number', 
            'license_number', 'license_image', 'profile_photo', 'is_verified'
        ]
        read_only_fields = ['is_verified']

    def update(self, instance, validated_data):
        # If they update their license, we reset verification to False for re-review
        instance.is_verified = False 
        return super().update(instance, validated_data)



class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            # Get the user_type from the linked profile
            user_type = getattr(user.profile, 'user_type', 'passenger')
            return {
                'token': 'your_token_logic_here', # e.g., str(RefreshToken.for_user(user).access_token)
                'username': user.username,
                'user_type': user_type
            }
        raise serializers.ValidationError("Invalid username or password.")
