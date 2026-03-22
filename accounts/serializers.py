from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from .models import UserProfile 
from rejea_app.models import Vehicle, Trip 

User = get_user_model()

# 1. USER PROFILE SERIALIZER
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'user_type', 'is_verified', 'phone_number']

# 2. TRANSPORT SERIALIZERS (Moved up to prevent 'not defined' errors)
class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'

# 3. DRIVER PROFILE SERIALIZER
class DriverProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    vehicle = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'username', 'email', 'phone_number', 'id_number', 
            'license_number', 'license_image', 'profile_photo', 'is_verified', 'vehicle'
        ]
        read_only_fields = ['is_verified']

    def get_vehicle(self, obj):
        # Accessing the vehicle linked to the user
        vehicle = Vehicle.objects.filter(driver=obj.user).first()
        if vehicle:
            return VehicleSerializer(vehicle).data
        return None    

# 4. REGISTER SERIALIZER
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True) 
    user_type = serializers.CharField(write_only=True, default='passenger')
    phone_number = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'user_type', 'phone_number']

    def create(self, validated_data):
        user_type = validated_data.pop('user_type', 'passenger')
        phone_number = validated_data.pop('phone_number', "")
        
        # Create user
        user = User.objects.create_user(**validated_data)

        # Use get_or_create to avoid errors if a signal already created the profile
        profile, created = UserProfile.objects.get_or_create(user=user)
        profile.user_type = user_type
        profile.phone_number = phone_number
        profile.save()
        
        return user

# 5. LOGIN SERIALIZER
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # authenticate() usually takes 'request' as first arg, but kwargs are fine
        user = authenticate(username=data.get('username'), password=data.get('password'))
        if user and user.is_active:
            return {
                'username': user.username,
                'user_type': user.profile.user_type,
                'is_verified': user.profile.is_verified,
                'token': 'your_jwt_logic_here' 
            }
        raise serializers.ValidationError("Invalid credentials.")
