from django.urls import path
from rejea_app.views import (
    VehicleManagementView,
    DriverSetupView,
    ToggleAvailabilityView,
    ActiveDriverListView,
    DriverProfileView,
    UpdateLocationView,
    AvailableTripsView,
    BookSeatView,
    MpesaCallbackView,
    TripSeatsView,
    LockSeatView

)


urlpatterns = [
    path('register-vehicle/', VehicleManagementView.as_view(), name='register_vehicle'),
    path('toggle-availability/', ToggleAvailabilityView.as_view(), name='toggle-availability'),
    path('update-location/', UpdateLocationView.as_view(), name='update-location'),
    path('available-trips/', AvailableTripsView.as_view(), name='available_trips'),
    path('api/trips/bus/<int:trip_id>/seats/', TripSeatsView.as_view()),
    path('api/trips/lock-seat/', LockSeatView.as_view()),
    path('book-seat/<int:seat_id>/', BookSeatView.as_view(), name='book_seat'),
    path('mpesa-callback/', MpesaCallbackView.as_view(), name='mpesa_callback'),
    path('driver-profile/', DriverProfileView.as_view(), name='driver_profile'),
    path('driver-setup/', DriverSetupView.as_view(), name='driver_setup'),
    path('active-drivers/', ActiveDriverListView.as_view(), name='active_drivers'),
]
