from django.views.generic import ListView
from django.http import JsonResponse
from trips.models import Trip # Or wherever your Trip model is

class TripListView(ListView):
    model = Trip
    template_name = 'trips/trip_list.html' # Make sure this template exists
    context_object_name = 'trips'

def index(request):
    from django.http import HttpResponse
    return HttpResponse("Welcome to Rejea!")
class AvailableTripsView(ListView):
    model = Trip
    template_name = 'trips/available_trips.html' # Create this template to display trips
    context_object_name = 'trips'

    def get_queryset(self):
        from django.utils import timezone
        return Trip.objects.filter(departure_time__gte=timezone.now())

def get_trips(request):
    # In a real app, this data would come from your Database (Models)
    trips_data = [
        {"id": 1, "route": "Nairobi to Nakuru", "price": 800, "seats": 14},
        {"id": 2, "route": "Nairobi to Kisumu", "price": 1500, "seats": 8},
        {"id": 3, "route": "Nairobi to Mombasa", "price": 1200, "seats": 22},
    ]
    return JsonResponse(trips_data, safe=False)
