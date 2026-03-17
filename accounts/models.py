from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # This allows one login system for both dashboards
    is_driver = models.BooleanField(default=False)
    is_passenger = models.BooleanField(default=True)
    phone_number = models.CharField(max_length=15, unique=True, null=True)
    def __str__(self):
        return self.username


class DriverProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='driver_profile')
    license_number = models.CharField(max_length=50)
    is_active = models.BooleanField(default=False)
    # Add any other driver-specific fields here
    
    def __str__(self):
        return self.user.username



