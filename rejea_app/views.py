from django.db import transaction as db_transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django_daraja.mpesa.core import MpesaClient

from .models import Vehicle, Trip, Seat, Transaction
from .serializers import VehicleSerializer, TripSerializer, DriverProfileSerializer
from accounts.models import UserProfile

# 1. VEHICLE & DRIVER MANAGEMENT
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

class DriverSetupView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request):
        profile = request.user.profile
        profile.id_number = request.data.get('id_number', profile.id_number)
        profile.license_number = request.data.get('license_number', profile.license_number)
        profile.save()
        return Response({"message": "Driver details updated"}, status=status.HTTP_200_OK)

class DriverProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DriverProfileSerializer

    def get_object(self):
        return self.request.user.profile

    def get(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

# 2. PASSENGER & TRIP VIEWS
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

class ActiveDriverListView(APIView):
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

class TripSeatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, trip_id):
        seats = Seat.objects.filter(trip_id=trip_id).order_by('id')
        data = [{
            "id": s.id,
            "seat_number": s.seat_number,
            "is_booked": s.is_booked
        } for s in seats]
        return Response(data)

# 3. BOOKING & PAYMENTS
class LockSeatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        seat_id = request.data.get('seat_id')
        seat = get_object_or_404(Seat, id=seat_id)
        return Response({"status": "locked", "seat_id": seat.id})

class BookSeatView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, seat_id):
        phone_number = request.data.get('phone_number')
        if not phone_number:
            return Response({"error": "Phone number required"}, status=400)

        with db_transaction.atomic():
            seat = get_object_or_404(Seat.objects.select_for_update(), id=seat_id)
            if seat.is_booked or Transaction.objects.filter(seat=seat, status='Pending').exists():
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
                return Response({"error": f"M-Pesa error: {str(e)}"}, status=500)
        return Response({"error": "M-Pesa request failed"}, status=500)

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
                    transaction.status = 'Success'
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

# 4. LOCATION TRACKING
class UpdateLocationView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        vehicle = Vehicle.objects.filter(driver=request.user).first()
        if not vehicle:
            return Response({"error": "No vehicle linked to user"}, status=404)
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        if lat and lng:
            vehicle.current_lat = lat
            vehicle.current_lng = lng
            vehicle.save()
            return Response({"message": "Location updated"})
        return Response({"error": "Invalid coordinates"}, status=400)


ToggleAvailabilityView = VehicleManagementView
