from django.contrib import admin
from django.urls import path, include
from payments.views import MpesaCallbackView, STKPushView 
from accounts.views import (
    UpdateLocationView, 
    ToggleAvailabilityView, 
    TripSeatsView, 
    ActiveDriverListView, 
    DriverProfileView, 
    DriverSetupView,
    LockSeatView

)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    
    # Driver Endpoints
    path('api/accounts/toggle-availability/', ToggleAvailabilityView.as_view(), name='toggle-avail'),
    path('api/update-location/', UpdateLocationView.as_view(), name='update-loc'),  
    
    # Passenger/Trip Endpoints (Matches your SeatGrid.js calls)
    path('api/trips/bus/<int:trip_id>/seats/', TripSeatsView.as_view(), name='trip-seats'),
    path('api/trips/lock-seat/', LockSeatView.as_view(), name='lock-seat'), # <--- ADD THIS
    
    # App inclusions
    path('api/payments/', include('payments.urls')),
    path('api/rejea/', include('rejea_app.urls')),
    path('api/payments/callback/', MpesaCallbackView.as_view()),
    path('api/payments/stk-push/', STKPushView.as_view()),  
]
