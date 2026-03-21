from django.contrib.auth import get_user_model, authenticate
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from rest_framework import serializers
from accounts.models import UserProfile 

# Attempt to import from rejea_app, fallback if names differ
try:
    from rejea_app.models import Vehicle, Trip
except ImportError:
    Vehicle = None
    Trip = None

User = get_user_model()

# 1. USER PROFILE SERIALIZER
class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'email', 'user_type', 'is_verified', 'phone_number']

# 2. DRIVER PROFILE SERIALIZER
class DriverProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = [
            'username', 'email', 'phone_number', 'id_number', 
            'license_number', 'license_image', 'profile_photo', 'is_verified'
        ]
        read_only_fields = ['is_verified']

# 3. REGISTER SERIALIZER
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    user_type = serializers.CharField(write_only=True, default='passenger')
    phone_number = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'password', 'email', 'user_type', 'phone_number', 'number_of_seats']

    def create(self, validated_data):
        user_type = validated_data.pop('user_type', 'passenger')
        phone_number = validated_data.pop('phone_number', "")
        user = User.objects.create_user(**validated_data)
        
        # Profile is created by signal, we just update it
        profile = user.profile
        profile.user_type = user_type
        profile.phone_number = phone_number
        profile.save()
        return user

# 4. LOGIN SERIALIZER
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return {
                'username': user.username,
                'user_type': user.profile.user_type,
                'token': 'placeholder_token'
            }
        raise serializers.ValidationError("Invalid credentials")

# 5. TRANSPORT SERIALIZERS (Requested by other views)
class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
            model = Vehicle
            fields = ['plate_number', 'model', 'color']

class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = '__all__'

class DriverLocationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Join a group for all active drivers
        await self.channel_layer.group_add("active_drivers", self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)
        lat = data.get('latitude')
        lng = data.get('longitude')
        user_id = self.scope['user'].id

        # Update DB asynchronously
        await self.update_driver_location(user_id, lat, lng)

        # Broadcast the new position to everyone tracking drivers
        await self.channel_layer.group_send(
            "active_drivers",
            {
                "type": "location_update",
                "driver_id": user_id,
                "latitude": lat,
                "longitude": lng
            }
        )

    @database_sync_to_async
    def update_driver_location(self, user_id, lat, lng):
        UserProfile.objects.filter(user_id=user_id).update(latitude=lat, longitude=lng)

    async def location_update(self, event):
        # Send the broadcasted data to the specific WebSocket client
        await self.send(text_data=json.dumps(event))