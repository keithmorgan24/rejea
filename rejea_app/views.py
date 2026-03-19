from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Vehicle, Trip, Seat

# 1. DRIVER: Toggle Status & Start Trip
class ToggleVehicleStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        vehicle = get_object_or_404(Vehicle, driver=request.user)
        vehicle.is_active = not vehicle.is_active
        vehicle.save()

        if vehicle.is_active:
            # Create a new active Trip
            trip = Trip.objects.create(
                vehicle=vehicle, 
                status='active', 
                start_time=timezone.now(),
                is_completed=False
            )
            
            # GENERATE 14 SEATS for the SeatGrid
            seats = [
                Seat(trip=trip, seat_number=str(i), is_booked=False) 
                for i in range(1, 15)
            ]
            Seat.objects.bulk_create(seats)
            
            return Response({
                "message": "Vehicle is active. 14 seats generated.",
                "trip_id": trip.id
            }, status=status.HTTP_201_CREATED)
        
        else:
            # End current trips when going offline
            Trip.objects.filter(vehicle=vehicle, is_completed=False).update(
                is_completed=True, 
                status='completed',
                end_time=timezone.now()
            )
            return Response({"message": "Vehicle is now offline."})

# 2. PASSENGER: View Active Trips
class AvailableTripsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        active_trips = Trip.objects.filter(
            status='active', 
            is_completed=False, 
            vehicle__is_active=True
        )
        data = [{
            "trip_id": t.id,
            "plate": t.vehicle.plate_number,
            "driver": t.vehicle.driver.username
        } for t in active_trips]
        return Response(data)

# 3. PASSENGER: View Seat Grid
class TripSeatGridView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, trip_id):
        seats = Seat.objects.filter(trip_id=trip_id).order_by('id')
        data = [{
            "id": s.id,
            "seat_number": s.seat_number,
            "is_booked": s.is_booked
        } for s in seats]
        return Response(data)

class BookSeatView(APIView):
    """
    This view handles the initial 'lock' on a seat.
    It should trigger the M-Pesa STK Push.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, seat_id):
        # 1. Get the specific seat
        seat = get_object_or_404(Seat, id=seat_id)

        # 2. Check if it's already booked or locked
        if seat.is_booked:
            return Response(
                {"error": "This seat is already booked."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Logic for M-Pesa STK Push would go here
        # For now, we simulate a successful initiation
        phone_number = request.data.get('phone_number') # Expecting phone from React
        
        if not phone_number:
            return Response(
                {"error": "Phone number is required for M-Pesa payment."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Optional: Temporarily 'lock' the seat for 5 minutes 
        # so others can't click it while the user types their PIN.
        # seat.is_booked = True 
        # seat.save()

        return Response({
            "message": f"STK Push sent to {phone_number}. Please enter your PIN.",
            "seat_number": seat.seat_number,
            "amount": "50", # You can make this dynamic based on the trip
            "status": "pending_payment"
        }, status=status.HTTP_200_OK)