from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
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
from rejea_app.serializers import VehicleSerializer

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
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 2. Login View
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        token, _ = Token.objects.get_or_create(user=user)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        # KEY FIX: Fetch vehicle so the driver skips the registration form on login
        vehicle = Vehicle.objects.filter(driver=user).first()
        vehicle_data = VehicleSerializer(vehicle).data if vehicle else None
        
        return Response({
            "token": token.key,
            "user_type": profile.user_type,
            "username": user.username,
            "is_verified": profile.is_verified,
            "vehicle": vehicle_data # <--- This is the magic line for React
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
        vehicle = Vehicle.objects.filter(driver=request.user).first()
        if not vehicle:
            return Response({"error": "No vehicle registered"}, status=404)
        
        vehicle.is_active = not vehicle.is_active
        vehicle.save()

        if vehicle.is_active:
            trip = Trip.objects.create(vehicle=vehicle, status='active')
            
            # Use the actual vehicle capacity
            capacity = getattr(vehicle, 'total_seats', 14) 
            seats = [Seat(trip=trip, seat_number=str(i)) for i in range(1, capacity + 1)]
            Seat.objects.bulk_create(seats)
                
            return Response({
                "is_available": True, 
                "trip_id": trip.id
            }, status=status.HTTP_200_OK)
        
        Trip.objects.filter(vehicle=vehicle, status='active').update(status='completed', is_completed=True)
        return Response({"is_available": False}, status=200)
# 7. Active Driver List View (Fixed field names)
class ActiveDriverListView(APIView):
    """List of drivers currently online for the map."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        active_vehicles = Vehicle.objects.filter(is_active=True).select_related('driver')
        data = []
        for v in active_vehicles:
            active_trip = Trip.objects.filter(vehicle=v, status='active', is_completed=False).first()
            data.append({
                "id": v.id,
                "trip_id": active_trip.id if active_trip else None,
                "plate": v.plate_number,
                "model": v.model,
                "driver": v.driver.username,
                "capacity": getattr(v, 'total_seats', 14),
                "current_lat": getattr(v, 'current_lat', None),
                "current_lng": getattr(v, 'current_lng', None)
            })
        return Response(data)

class VehicleManagementView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Register or Update a vehicle."""
        if request.user.profile.user_type != 'driver':
            return Response({"error": "Only drivers can register vehicles"}, status=403)
            
        total_seats = request.data.get('total_seats') or 14
        
        vehicle, created = Vehicle.objects.update_or_create(
            driver=request.user,
            defaults={
                "plate_number": request.data.get('plate_number'),
                "model": request.data.get('model'),
                "color": request.data.get('color'),
                "total_seats": total_seats,
            }
        )
        
        serializer = VehicleSerializer(vehicle)
        return Response({
            "message": "Vehicle saved successfully",
            "vehicle": serializer.data
        }, status=status.HTTP_201_CREATED)

    def patch(self, request):
        """Toggle driver availability and manage trip lifecycle."""
        user = request.user
        profile = user.profile

        if profile.user_type != 'driver':
            return Response({"error": "Unauthorized"}, status=403)

        vehicle = get_object_or_404(Vehicle, driver=user)
        
        with db_transaction.atomic():
            profile.is_available = not getattr(profile, 'is_available', False)
            profile.save()
            
            vehicle.is_active = profile.is_available
            vehicle.save()

            if profile.is_available:
                Trip.objects.filter(vehicle=vehicle, is_completed=False).update(
                    is_completed=True, status='completed', end_time=timezone.now()
                )
                trip = Trip.objects.create(vehicle=vehicle, status='active')
                
                capacity = getattr(vehicle, 'total_seats', 14)
                seats = [Seat(trip=trip, seat_number=str(i)) for i in range(1, capacity + 1)]
                Seat.objects.bulk_create(seats)
                
                return Response({
                    "is_available": True,
                    "trip_id": trip.id,
                    "message": f"Vehicle active. {capacity} seats generated."
                })
            else:
                Trip.objects.filter(vehicle=vehicle, is_completed=False).update(
                    is_completed=True, status='completed', end_time=timezone.now()
                )
                return Response({"is_available": False, "message": "Vehicle is now offline."})

# 8. Update Location View
class UpdateLocationView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        vehicle = Vehicle.objects.filter(driver=request.user).first()
        if not vehicle:
            return Response({"error": "No vehicle"}, status=404)
        vehicle.current_lat = request.data.get('latitude')
        vehicle.current_lng = request.data.get('longitude')
        vehicle.save()
        return Response({"message": "Location updated"})

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

class AvailableTripsView(APIView):
    """View to see all currently active trips."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        active_trips = Trip.objects.filter(
            status='active', 
            is_completed=False, 
            vehicle__is_active=True
        ).select_related('vehicle', 'vehicle__driver')
        serializer = TripSerializer(active_trips, many=True)
        return Response(serializer.data)

class BookSeatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, seat_id):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response({"error": "Phone number required"}, status=400)

        with db_transaction.atomic():
            seat = get_object_or_404(Seat.objects.select_for_update(), id=seat_id)
            if seat.is_booked:
                return Response({"error": "Seat is unavailable"}, status=400)

            cl = MpesaClient()
            amount = 1 
            account_ref = f"SEAT{seat.id}"
            desc = f"Seat {seat.seat_number} Booking"
            callback_url = "https://unsinewed-dumpily-muriel.ngrok-free.dev"

            try:
                response = cl.stk_push(phone_number, amount, account_ref, desc, callback_url)
                if response.response_code == "0":
                    Transaction.objects.create(
                        checkout_request_id=response.checkout_request_id,
                        seat=seat, amount=amount, phone_number=phone_number, status='Pending'
                    )
                    return Response({"message": "Payment prompt sent", "checkout_id": response.checkout_request_id})
            except Exception as e:
                return Response({"error": str(e)}, status=500)
        return Response({"error": "M-Pesa request failed"}, status=500)

@method_decorator(csrf_exempt, name='dispatch')
class MpesaCallbackView(APIView):
    permission_classes = [permissions.AllowAny]
    def post(self, request):
        # ... your callback logic ...
        return Response({"ResultCode": 0, "ResultDesc": "Success"})