from rest_framework import serializers
from .models import Vehicle, Trip, Seat

class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ['id', 'seat_number', 'is_booked', 'is_locked']

class TripSerializer(serializers.ModelSerializer):
    # Nests the 14 seats inside the trip object for the React SeatGrid
    seats = SeatSerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = ['id', 'route_name', 'departure_time', 'price', 'is_completed', 'seats']

class VehicleSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source='driver.username', read_only=True)
    current_trip_id = serializers.SerializerMethodField()

    class Meta:
        model = Vehicle
        fields = [
            'id', 
            'vehicle_reg', 
            'driver_name', 
            'capacity', 
            'is_active', 
            'current_lat', 
            'current_lng',
            'current_trip_id'
        ]

    def get_current_trip_id(self, obj):
        """Finds the ID of the trip that is currently 'Active' for this bus"""
        active_trip = Trip.objects.filter(vehicle=obj, is_completed=False).first()
        return active_trip.id if active_trip else None