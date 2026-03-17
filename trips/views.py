from django.shortcuts import render
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Seat

class LockSeatView(APIView):
    def post(self, request, seat_id):
        with transaction.atomic():
            # This locks the row in the DB until the 'with' block ends
            seat = Seat.objects.select_for_update().get(id=seat_id)
            
            if seat.is_available():
                seat.locked_by = request.user
                seat.locked_at = timezone.now()
                seat.save()
                return Response({"status": "locked", "message": "Seat held for 5 mins"})
            
            return Response({"status": "failed", "message": "Seat already taken"}, status=400)

# Create your views here.
class TripListView(APIView):
    def get(self, request):
        # 1. Get all available bus trips (Nairobi to Nakuru, etc.)
        trips = Trip.objects.filter(departure_time__gte=timezone.now())
        data = []
        for trip in trips:
            data.append({
                "id": trip.id,
                "origin": trip.origin,
                "destination": trip.destination,
                "departure_time": trip.departure_time,
                "available_seats": trip.available_seats,
                "price_per_seat": trip.price_per_seat
            })
        return Response(data)
class SeatListView(APIView):
    def get(self, request, trip_id):
        # 2. Get the seat layout for a specific bus (e.g., /api/trips/bus/5/seats/)
        seats = Seat.objects.filter(trip_id=trip_id)
        data = []
        for seat in seats:
            data.append({
                "id": seat.id,
                "seat_number": seat.seat_number,
                "is_booked": seat.is_booked,
                "is_available": seat.is_available()
            })
        return Response(data)