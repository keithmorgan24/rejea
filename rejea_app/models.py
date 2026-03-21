from django.db import models 
from django.conf import settings
import json
from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_daraja.mpesa.core import MpesaClient 
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils import timezone


class Vehicle(models.Model):
    driver = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='vehicles')
    plate_number = models.CharField(max_length=20)
    model = models.CharField(max_length=50)
    color = models.CharField(max_length=30)
    is_active = models.BooleanField(default=False) # Sync with driver's availability
class Transaction(models.Model):
    # The unique ID from Safaricom's initial response
    checkout_request_id = models.CharField(max_length=100, unique=True)
    # Link this to what is being paid for (e.g., a Seat)
    seat = models.ForeignKey('Seat', on_delete=models.CASCADE, related_name='payments')
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    phone_number = models.CharField(max_length=15)
    mpesa_receipt_number = models.CharField(max_length=50, blank=True, null=True)
    status = models.CharField(max_length=20, default='Pending') # Pending, Success, Failed
    created_at = models.DateTimeField(auto_now_add=True)

class Trip(models.Model):  # <--- Make sure this line exists
    vehicle = models.ForeignKey('Vehicle', on_delete=models.CASCADE)
    status = models.CharField(max_length=20, default='active')
    is_completed = models.BooleanField(default=False)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Trip {self.id}"

class Seat(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='seats')
    seat_number = models.CharField(max_length=10)
    is_booked = models.BooleanField(default=False)
    is_locked = models.BooleanField(default=False) 
    locked_at = models.DateTimeField(null=True, blank=True)