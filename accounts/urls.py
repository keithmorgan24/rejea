from django.urls import path
# Import account-related views from the current app
from .views import (
    RegisterView, 
    LoginView, 
    UserProfileView, 
    DriverProfileView, 
    DriverSetupView,
    ToggleAvailabilityView
)

# Import transport-related views from rejea_app
from rejea_app.views import (
    VehicleManagementView,
    AvailableTripsView,
    BookSeatView,
    MpesaCallbackView,
    ActiveDriverListView,
    UpdateLocationView
)


urlpatterns = [
    # Auth & Profile
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Driver Specific
    path('driver-setup/', DriverSetupView.as_view(), name='driver-setup'),
    path('driver-profile/', DriverProfileView.as_view(), name='driver-profile'),  
    path('register-vehicle/', VehicleManagementView.as_view(), name='register_vehicle'),
    path('toggle-availability/', ToggleAvailabilityView.as_view(), name='toggle-availability'),
    path('toggle-status/', VehicleManagementView.as_view(), name='toggle-status'),
    path('update-location/', UpdateLocationView.as_view(), name='update-location'),
    
    # Passenger Specific
    path('active-drivers/', ActiveDriverListView.as_view(), name='active-drivers'),
    path('available-trips/', AvailableTripsView.as_view(), name='available-trips'),
    path('book-seat/<int:seat_id>/', BookSeatView.as_view(), name='book-seat'),
    
    # Payment Callback
    path('mpesa/callback/', MpesaCallbackView.as_view(), name='mpesa-callback'),
]
