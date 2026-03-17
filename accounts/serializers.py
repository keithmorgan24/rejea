from rest_framework import serializers
from .models import User, DriverProfile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'is_driver', 'phone_number']

class DriverProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = DriverProfile
        fields = ['user', 'vehicle_reg', 'is_active', 'current_lat', 'current_lng']

class RegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'password', 'is_driver', 'phone_number']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            is_driver=validated_data.get('is_driver', False),
            phone_number=validated_data.get('phone_number')
        )
        return user
