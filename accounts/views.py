from rest_framework.authtoken.models import Token
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from .serializers import DriverProfileSerializer 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token # Added for Login
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .models import User, UserProfile
from rejea_app.models import Vehicle, Trip, Seat


# 1. Registration View: Creates User + Profile
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
            # Create profile and set verification to False by default
            # UserProfile.objects.create(
            #     user=user,
            #     user_type=data.get('user_type', 'passenger'),
            #     is_verified=False 
            # )
            # Generate token immediately so they are logged in after reg
            token, _ = Token.objects.get_or_create(user=user)
            
            return Response({
                "message": "User created successfully",
                "token": token.key
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

# 2. Login View: Real Token implementation
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            profile, created = UserProfile.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user_type": profile.user_type,
                "username": user.username,
                "is_verified": profile.is_verified
            }, status=status.HTTP_200_OK)
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# 3. Driver Setup View
class DriverSetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        profile = getattr(request.user, 'userprofile', None)
        if not profile:
            return Response({"error": "Profile not found"}, status=status.HTTP_404_NOT_FOUND)
            
        profile.id_number = request.data.get('id_number', profile.id_number)
        profile.license_number = request.data.get('license_number', profile.license_number)
        profile.save()
        return Response({"message": "Driver details updated"}, status=status.HTTP_200_OK)

# 4. Toggle Availability: Switches vehicle status and handles Seat generation
class ToggleAvailabilityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        vehicle = get_object_or_404(Vehicle, driver=request.user)
        vehicle.is_active = not vehicle.is_active
        vehicle.save()

        if vehicle.is_active:
            # 1. Create a new trip
            trip = Trip.objects.create(vehicle=vehicle, status='active')
            
            # 2. Generate Seats based on vehicle capacity (Missing logic added)
            # Assuming your Vehicle model has a 'capacity' field
            capacity = getattr(vehicle, 'capacity', 4) 
            for i in range(1, capacity + 1):
                Seat.objects.create(trip=trip, seat_number=str(i), is_available=True)
                
            return Response({
                "status": "Active", 
                "trip_id": trip.id,
                "seats_created": capacity
            }, status=status.HTTP_200_OK)
        
        # If toggling OFF, mark active trips as completed
        Trip.objects.filter(vehicle=vehicle, status='active').update(status='completed')
        return Response({"status": "Inactive"}, status=status.HTTP_200_OK)

# 5. Active Driver List View
class ActiveDriverListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        active_vehicles = Vehicle.objects.filter(is_active=True)
        data = [
            {
                "id": v.id, 
                "plate": v.plate_number, 
                "driver": v.driver.username,
                "capacity": getattr(v, 'capacity', 'N/A')
            } for v in active_vehicles
        ]
        return Response(data, status=status.HTTP_200_OK)

# 6. Update Location View
class UpdateLocationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        profile = request.user.userprofile
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        
        if lat and lng:
            profile.latitude = lat
            profile.longitude = lng
            profile.save()
            return Response({"message": "Location updated"}, status=status.HTTP_200_OK)
        return Response({"error": "Latitude and Longitude required"}, status=status.HTTP_400_BAD_REQUEST)

class DriverProfileView(generics.RetrieveUpdateAPIView):
    """
    Handles retrieving and updating driver-specific information.
    """
    serializer_class = DriverProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        # This ensures a driver only gets THEIR own profile
        # and prevents passengers from accessing driver logic
        return self.request.user.userprofile 

    def update(self, request, *args, **kwargs):
        # Safety check: Ensure the user actually has is_driver=True
        if not request.user.is_driver:
            return Response(
                {"error": "Access denied. User is not registered as a driver."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)