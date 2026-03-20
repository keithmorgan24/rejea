from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404

from .models import User, UserProfile
from .serializers import DriverProfileSerializer, UserProfileSerializer
from rejea_app.models import Vehicle, Trip, Seat

# 1. Registration View: Creates User + Profile (FIXED)
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        try:
            user = User.objects.create_user(
                username=data['username'],
                password=data['password'],
                email=data.get('email', '')
            )
            # Re-enabled: Ensure profile is created so frontend gets user_type
            UserProfile.objects.create(
                user=user,
                user_type=data.get('user_type', 'passenger'),
                is_verified=False 
            )
            
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "message": "User created successfully",
                "token": token.key
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# 2. Login View
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            # Safe fetch: Ensure profile exists before returning data
            profile, _ = UserProfile.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user_type": profile.user_type,
                "username": user.username,
                "is_verified": profile.is_verified
            }, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# 3. User Profile View: Fixed 'userprofile' Attribute Error
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # Using get_or_create prevents the crash if profile doesn't exist
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

# 4. Driver Profile View
class DriverProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = DriverProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        return profile

# 5. Driver Setup View
class DriverSetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.id_number = request.data.get('id_number', profile.id_number)
        profile.license_number = request.data.get('license_number', profile.license_number)
        profile.save()
        return Response({"message": "Driver details updated"}, status=status.HTTP_200_OK)

# 6. Toggle Availability: Switches vehicle status
class ToggleAvailabilityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        vehicle = get_object_or_404(Vehicle, driver=request.user)
        vehicle.is_active = not vehicle.is_active
        vehicle.save()

        if vehicle.is_active:
            trip = Trip.objects.create(vehicle=vehicle, status='active')
            capacity = getattr(vehicle, 'capacity', 14) 
            for i in range(1, capacity + 1):
                Seat.objects.create(trip=trip, seat_number=str(i), is_available=True)
                
            return Response({
                "status": "Active", 
                "trip_id": trip.id
            }, status=status.HTTP_200_OK)
        
        Trip.objects.filter(vehicle=vehicle, status='active').update(status='completed')
        return Response({"status": "Inactive"}, status=status.HTTP_200_OK)

# 7. Active Driver List View (Fixed field names)
class ActiveDriverListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        active_vehicles = Vehicle.objects.select_related('driver').filter(is_active=True)
        data = [{
            "id": v.id, 
            "plate": v.vehicle_reg, # Matches your Vehicle model
            "driver": v.driver.username if v.driver else "Unknown",
            "capacity": v.capacity,
            "current_lat": v.current_lat,
            "current_lng": v.current_lng
        } for v in active_vehicles]
        return Response(data, status=status.HTTP_200_OK)

# 8. Update Location View
class UpdateLocationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        vehicle = get_object_or_404(Vehicle, driver=request.user)
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        
        if lat and lng:
            vehicle.current_lat = lat
            vehicle.current_lng = lng
            vehicle.save()
            return Response({"message": "Location updated"}, status=status.HTTP_200_OK)
        return Response({"error": "Latitude and Longitude required"}, status=status.HTTP_400_BAD_REQUEST)
