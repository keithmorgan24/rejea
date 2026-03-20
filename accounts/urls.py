from django.contrib import admin
from django.urls import path, include
from accounts.views import RegisterView, LoginView, DriverSetupView, ToggleAvailabilityView, ActiveDriverListView, UpdateLocationView, UserProfileView, DriverProfileView
from .views import UserProfileView, DriverProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('driver-setup/', DriverSetupView.as_view(), name='driver-setup'),  
    path('toggle-availability/', ToggleAvailabilityView.as_view(), name='toggle-availability'),
    path('active-drivers/', ActiveDriverListView.as_view(), name='active-drivers'),
    path('update-location/', UpdateLocationView.as_view(), name='update-location'),




]

