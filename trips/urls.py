from django.urls import path
from .views import TripListView, LockSeatView

urlpatterns = [
    # This creates the endpoint: /api/trips/
    path('', TripListView.as_view(), name='trip-list'),
    
    # This creates the endpoint: /api/trips/lock-seat/
    path('lock-seat/', LockSeatView.as_view(), name='lock-seat'),
    
]