from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from django.conf import settings
from django.db import models

class Vehicle(models.Model):
    # Change 'User' to settings.AUTH_USER_MODEL
    driver = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='vehicle'
    )
    vehicle_reg = models.CharField(max_length=20, unique=True)
    capacity = models.IntegerField(default=14)
    is_active = models.BooleanField(default=False)
    # ... rest of your fields

class Trip(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='trips')
    route_name = models.CharField(max_length=255, default="Nairobi - Local")
    departure_time = models.DateTimeField(auto_now_add=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_completed = models.BooleanField(default=False)

    def _str_(self):
        status = "Completed" if self.is_completed else "Active"
        return f"{self.route_name} ({status}) - {self.vehicle.vehicle_reg}"

class Seat(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.IntegerField()
    is_booked = models.BooleanField(default=False)
    
    # Locking mechanism for the M-Pesa payment window
    is_locked = models.BooleanField(default=False)
    locked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('trip', 'seat_number')
        ordering = ['seat_number']

    def _str_(self):
        return f"Seat {self.seat_number} - {self.trip.vehicle.vehicle_reg}"

# --- AUTOMATION SIGNAL ---
# This creates 14 seats automatically whenever a new Trip is saved
@receiver(post_save, sender=Trip)
def auto_create_seats(sender, instance, created, **kwargs):
    if created:
        num_seats = instance.vehicle.capacity
        seats = [Seat(trip=instance, seat_number=i) for i in range(1, num_seats + 1)]
        Seat.objects.bulk_create(seats)