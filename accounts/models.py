from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # This allows one login system for both dashboards
    is_driver = models.BooleanField(default=False)
    is_passenger = models.BooleanField(default=True)
    phone_number = models.CharField(max_length=15, unique=True, null=True)