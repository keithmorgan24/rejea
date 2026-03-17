from django.db import models
from django.conf import settings
from django.utils import timezone

class Trip(models.Model):
    # Link to built-in User using settings.AUTH_USER_MODEL
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='driver_trips'
    )
    origin = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    departure_time = models.DateTimeField()
    arrival_time = models.DateTimeField()
    total_seats = models.IntegerField()
    available_seats = models.IntegerField()
    price_per_seat = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.origin} to {self.destination} at {self.departure_time}"

class Seat(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.IntegerField()
    is_booked = models.BooleanField(default=False)
    locked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name='rejea_locked_seats')
    locked_at = models.DateTimeField(null=True, blank=True)

    def is_available(self):
        if self.is_booked:
            return False
        if self.locked_at:
            # Check if 5 minutes have passed since locking
            expiry_time = self.locked_at + timezone.timedelta(minutes=5)
            return timezone.now() > expiry_time
        return True


class Booking(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='bookings')
    passenger = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='passenger_bookings'
    )
    seat = models.ForeignKey(Seat, on_delete=models.CASCADE, related_name='booking')
    booking_time = models.DateTimeField(auto_now_add=True)  
    payment_status = models.CharField(max_length=20, default='pending')

class Bus(models.Model):
    trip = models.OneToOneField(Trip, on_delete=models.CASCADE, related_name='bus_details')
    license_plate = models.CharField(max_length=20)
    model = models.CharField(max_length=50)
    year = models.IntegerField()
    driver_name = models.CharField(max_length=100)      
    driver_contact = models.CharField(max_length=20)    
    def __str__(self):
        return f"{self.model} ({self.license_plate}) driven by {self.driver_name}"  


    
