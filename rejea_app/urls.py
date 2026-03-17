from django.urls import path
from . import views

urlpatterns = [
    path('available/', views.AvailableTripsView.as_view(), name='available_trips'),
    path('list/', views.get_trips, name='get_trips'), 
]
