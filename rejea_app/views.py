from django.db import transaction as db_transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status, permissions, generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django_daraja.mpesa.core import MpesaClient

from .models import Vehicle, Trip, Seat, Transaction
from .serializers import VehicleSerializer, TripSerializer, DriverProfileSerializer
from accounts.models import UserProfile

# 1. DRIVER: Manage Vehicle & Live Status
class VehicleManagementView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Register a new vehicle."""
        # Use the profile to check user_type
        if request.user.profile.user_type != 'driver':
            return Response({"error": "Only drivers can register vehicles"}, status=403)
            
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(driver=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
        print("SERIALIZER ERRORS:", serializer.errors) 

    def patch(self, request):
        """Toggle driver availability and manage trip lifecycle."""
        user = request.user
        profile = user.profile

        if profile.user_type != 'driver':
            return Response({"error": "Unauthorized"}, status=403)

        vehicle = get_object_or_404(Vehicle, driver=user)
        
        with db_transaction.atomic():
            # 1. Toggle Status (Assuming is_available is on the UserProfile)
            profile.is_available = getattr(profile, 'is_available', False)
            profile.is_available = not profile.is_available
            profile.save()
            
            # Sync vehicle status
            vehicle.is_active = profile.is_available
            vehicle.save()

            if profile.is_available:
                # 2. Close any existing active trips to prevent orphans
                Trip.objects.filter(vehicle=vehicle, is_completed=False).update(
                    is_completed=True, status='completed', end_time=timezone.now()
                )
                # 3. Start new trip
                trip = Trip.objects.create(vehicle=vehicle, status='active')
                # 4. Generate 14 seats
                seats = [Seat(trip=trip, seat_number=str(i)) for i in range(1, 15)]
                Seat.objects.bulk_create(seats)
                
                return Response({
                    "status": "online",
                    "trip_id": trip.id,
                    "message": "Vehicle active. 14 seats generated."
                })
            else:
                # 5. End trip
                Trip.objects.filter(vehicle=vehicle, is_completed=False).update(
                    is_completed=True, status='completed', end_time=timezone.now()
                )
                return Response({"status": "offline", "message": "Vehicle is now offline."})

# 2. PASSENGER: View and Book
class AvailableTripsView(APIView):
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
        phone_number = request.data.get('phone_number') # Format: 2547XXXXXXXX
        if not phone_number:
            return Response({"error": "Phone number required"}, status=400)

        with db_transaction.atomic():
            # Lock the seat row to prevent double booking
            seat = get_object_or_404(Seat.objects.select_for_update(), id=seat_id)
            
            if seat.is_booked or Transaction.objects.filter(seat=seat, status='Pending').exists():
                return Response({"error": "Seat is unavailable"}, status=400)

            # Daraja Logic
            cl = MpesaClient()
            amount = 1 
            account_ref = f"SEAT{seat.id}"
            desc = f"Seat {seat.seat_number} Booking"
            # Ensure this URL is publicly accessible (Ngrok for local dev)
            callback_url = "https://unsinewed-dumpily-muriel.ngrok-free.dev",

            response = cl.stk_push(phone_number, amount, account_ref, desc, callback_url)

            if response.response_code == "0":
                Transaction.objects.create(
                    checkout_request_id=response.checkout_request_id,
                    seat=seat,
                    amount=amount,
                    phone_number=phone_number,
                    status='Pending'
                )
                return Response({
                    "message": "Payment prompt sent", 
                    "checkout_id": response.checkout_request_id
                })
            
        return Response({"error": "M-Pesa request failed"}, status=500)

# 3. CALLBACK: Webhook
@method_decorator(csrf_exempt, name='dispatch')
class MpesaCallbackView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        stk_callback = request.data.get('Body', {}).get('stkCallback', {})
        result_code = stk_callback.get('ResultCode')
        checkout_id = stk_callback.get('CheckoutRequestID')

        try:
            with db_transaction.atomic():
                transaction = Transaction.objects.select_for_update().get(checkout_request_id=checkout_id)
                
                if result_code == 0:
                    metadata = stk_callback.get('CallbackMetadata', {}).get('Item', [])
                    receipt = next((i['Value'] for i in metadata if i['Name'] == 'MpesaReceiptNumber'), None)
                    
                    transaction.status = 'Success'
                    transaction.mpesa_receipt_number = receipt
                    transaction.save()

                    seat = transaction.seat
                    seat.is_booked = True
                    seat.save()
                else:
                    transaction.status = 'Failed'
                    transaction.save()
        except Transaction.DoesNotExist:
            pass 

        return Response({"ResultCode": 0, "ResultDesc": "Success"})
ToggleAvailabilityView = VehicleManagementView 

# 2. Add the ActiveDriverListView (Passenger side)
class ActiveDriverListView(APIView):
    def get(self, request):
        active_vehicles = Vehicle.objects.filter(is_active=True).select_related('driver')
        data = []
        for v in active_vehicles:
            # Find the active trip for this vehicle
            active_trip = Trip.objects.filter(vehicle=v, status='active').first()
            data.append({
                "id": v.id,
                "trip_id": active_trip.id if active_trip else None, # CRITICAL
                "plate": v.plate_number,
                "model": v.model,
                "driver": v.driver.username,
                "current_lat": getattr(v, 'current_lat', None),
                "current_lng": getattr(v, 'current_lng', None)
            })
        return Response(data)

# 3. Add the DriverProfileView (Driver side)
class DriverProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DriverProfileSerializer

    def get_object(self):
        return self.request.user.profile

# 4. Add the UpdateLocationView (Live tracking)
class UpdateLocationView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        profile = request.user.profile
        profile.latitude = request.data.get('latitude')
        profile.longitude = request.data.get('longitude')
        profile.save()
        return Response({"message": "Location updated"})
DriverSetupView = DriverProfileView

class TripSeatsView(APIView):
    def get(self, request, trip_id):
        # Fetch seats for the specific trip
        seats = Seat.objects.filter(trip_id=trip_id).order_by('id')
        data = [{
            "id": s.id,
            "seat_number": s.seat_number,
            "is_booked": s.is_booked,
            "is_locked": getattr(s, 'is_locked', False) # Safety check for field
        } for s in seats]
        return Response(data)

class LockSeatView(APIView):
    def post(self, request):
        seat_id = request.data.get('seat_id')
        seat = get_object_or_404(Seat, id=seat_id)
        
        if seat.is_booked:
            return Response({"error": "Seat already booked"}, status=400)
            
        # Optional: Add a 'is_locked' boolean to your Seat model
        # For now, we can just return success to move to payment
        return Response({"status": "locked", "message": "Seat reserved for 5 mins"})