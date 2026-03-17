from django.conf import settings
from django.db import models

class Trip(models.Model):
    # Change 'auth.User' or User to settings.AUTH_USER_MODEL
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='trips_as_driver'
    )
    # ... other fields ...

class Seat(models.Model):
    # ... other fields ...
    locked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        related_name='locked_seats'
    )
