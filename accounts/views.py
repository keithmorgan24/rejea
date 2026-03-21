from .serializers import RegisterSerializer
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from .models import UserProfile
from .serializers import (
    RegisterSerializer, 
    LoginSerializer, 
    UserProfileSerializer, 
    DriverProfileSerializer
)
from rejea_app.models import Vehicle, Trip, Seat

# 1. Registration View: Creates User + Profile (FIXED)
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                "message": "User created successfully",
                "token": token.key,
                "user_type": getattr(user.profile, 'user_type', 'passenger')
            }, status=status.HTTP_201_CREATED)
        
        # This will return the "already exists" errors we handled in React
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# 2. Login View
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if not user:
            # FIX: Ensure this return is INSIDE the if block
            exists = User.objects.filter(username=username).exists()
            print(f"DEBUG: User {username} exists? {exists}")
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # If we reach here, user is authenticated
        token, _ = Token.objects.get_or_create(user=user)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        return Response({
            "token": token.key,
            "user_type": profile.user_type,
            "username": user.username,
            "is_verified": profile.is_verified
        }, status=status.HTTP_200_OK)

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
        # 1. Get the vehicle linked to this driver
        vehicle = Vehicle.objects.filter(driver=request.user).first()
        if not vehicle:
            return Response({"error": "No vehicle registered"}, status=404)
        
        # 2. Toggle the status
        vehicle.is_active = not vehicle.is_active
        vehicle.save()

        if vehicle.is_active:
            # 3. Create a new trip
            trip = Trip.objects.create(vehicle=vehicle, status='active')
            
            # 4. Create seats
            capacity = getattr(vehicle, 'capacity', 14) 
            for i in range(1, capacity + 1):
                Seat.objects.create(trip=trip, seat_number=str(i), is_booked=False)
                
            return Response({
                "is_available": True, 
                "trip_id": trip.id
            }, status=status.HTTP_200_OK)
        
        # 5. Handle going offline
        Trip.objects.filter(vehicle=vehicle, status='active').update(status='completed', is_completed=True)
        return Response({"is_available": vehicle.is_active}, status=200)
# 7. Active Driver List View (Fixed field names)
class ActiveDriverListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        active_vehicles = Vehicle.objects.select_related('driver').filter(is_active=True)
        data = []
        for v in active_vehicles:
            # We must find the active trip so the passenger knows what they are booking
            active_trip = Trip.objects.filter(vehicle=v, status='active').first()
            
            data.append({
                "id": v.id, 
                "trip_id": active_trip.id if active_trip else None, # CRITICAL for SeatGrid
                "plate": v.plate_number,
                "model": v.model,
                "color": v.color,
                "driver": v.driver.username if v.driver else "Unknown",
                "capacity": getattr(v, 'capacity', 14),
                "current_lat": getattr(v, 'current_lat', None),
                "current_lng": getattr(v, 'current_lng', None)
            })
        return Response(data, status=status.HTTP_200_OK)

class VehicleManagementView(APIView):
    def post(self, request):
        # FIXED INDENTATION HERE
        vehicle, created = Vehicle.objects.update_or_create(
            driver=request.user,
            defaults={
                "plate_number": request.data.get('plate_number'),
                "model": request.data.get('model'),
                "color": request.data.get('color'),
            }
        )
        return Response({"message": "Vehicle saved", "vehicle": {"plate_number": vehicle.plate_number}}, status=201)

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

class TripSeatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, trip_id):
        # Fetch seats for the specific trip (linked to your Seat model)
        seats = Seat.objects.filter(trip_id=trip_id).order_by('id')
        data = [{
            "id": s.id,
            "seat_number": s.seat_number,
            "is_booked": s.is_booked,
            "is_locked": getattr(s, 'is_locked', False) # Check if you added this field
        } for s in seats]
        return Response(data)

class LockSeatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        seat_id = request.data.get('seat_id')
        seat = get_object_or_404(Seat, id=seat_id)
        
        if seat.is_booked:
            return Response({"error": "This seat is already booked!"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Optional: set a temporary lock in DB if you added the 'is_locked' field
        if hasattr(seat, 'is_locked'):
            seat.is_locked = True
            seat.save()
            
        return Response({
            "status": "locked", 
            "message": "Seat reserved for 5 minutes. Proceed to payment."
        }, status=status.HTTP_200_OK)
