from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from accounts.models import UserProfile 


try:
    from rejea_app.models import Vehicle, Trip
except ImportError:
    Vehicle = None
    Trip = None

User = get_user_model()

# 1. VEHICLE SERIALIZER (Updated to include total_seats)
class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ['plate_number', 'model', 'color', 'total_seats'] # Added total_seats

# 2. DRIVER PROFILE SERIALIZER (Updated to include nested vehicle)
class DriverProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    # This nested serializer allows React to see the vehicle inside the profile
    vehicle = serializers.SerializerMethodField()

    class Meta:
        model = UserProfile
        fields = [
            'username', 'email', 'phone_number', 'id_number', 
            'license_number', 'license_image', 'profile_photo', 
            'is_verified', 'user_type', 'vehicle' 
        ]
        read_only_fields = ['is_verified']

    def get_vehicle(self, obj):
        if Vehicle:
            vehicle = Vehicle.objects.filter(driver=obj.user).first()
            if vehicle:
                return VehicleSerializer(vehicle).data
        return None

# 3. USER PROFILE SERIALIZER
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'user_type', 'is_verified', 'phone_number']

# 4. REGISTER SERIALIZER
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    user_type = serializers.CharField(write_only=True, default='passenger')
    phone_number = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'user_type', 'phone_number']

    def create(self, validated_data):
        user_type = validated_data.pop('user_type', 'passenger')
        phone_number = validated_data.pop('phone_number', "")
        user = User.objects.create_user(**validated_data)
        
        profile = user.profile
        profile.user_type = user_type
        profile.phone_number = phone_number
        profile.save()
        return user

# 5. TRIP SERIALIZER
class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'
