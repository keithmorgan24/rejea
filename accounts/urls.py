from django.urls import path
from .views import (
    RegisterView, 
    LoginView, 
    UserProfileView, 
    DriverProfileView, 
    DriverSetupView,
    ToggleAvailabilityView,
    ActiveDriverListView,
    UpdateLocationView,
    ToggleAvailabilityView
)
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('toggle-status/', ToggleAvailabilityView.as_view(), name='toggle-status'),
    path('update-location/', UpdateLocationView.as_view(), name='update-location'),
    path('driver-profile/', DriverProfileView.as_view(), name='driver-profile'),  
    path('driver-setup/', DriverSetupView.as_view(), name='driver-setup'),
    path('active-drivers/', ActiveDriverListView.as_view(), name='active-drivers'),
    



]

