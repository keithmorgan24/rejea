from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
     path('api/trips/', include('rejea_app.urls')), 
    path('api/payments/', include('payments.urls')),
    path('api/rejea/', include('rejea_app.urls')),  
    path('trips/', include('rejea_app.urls')),  # Add this line to include trips URLs

]
