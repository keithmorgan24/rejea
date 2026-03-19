from django.urls import path
from . import views

urlpatterns = [
    path('toggle-status/', views.ToggleVehicleStatusView.as_view(), name='toggle_status'),
    path('available/', views.AvailableTripsView.as_view(), name='available_trips'),
    path('trip/<int:trip_id>/seats/', views.TripSeatGridView.as_view(), name='trip_seats'),
]
