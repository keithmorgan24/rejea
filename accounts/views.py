from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import RegistrationSerializer
from .models import DriverProfile
from .serializers import DriverProfileSerializer

class RegisterView(APIView):
    def post(self, request):
        serializer = RegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "Account created successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        
        if user:
            return Response({
                "username": user.username,
                "is_driver": user.is_driver,
                "message": "Login successful"
            })
        return Response({"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)



class DriverProfileCreateView(APIView):
    def post(self, request):
        # We ensure only drivers can create a profile
        if not request.user.is_driver:
            return Response({"error": "User is not registered as a driver."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = DriverProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "Vehicle registered successfully!", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ToggleAvailabilityView(APIView):
    def post(self, request):
        profile = DriverProfile.objects.get(user=request.user)
        # Flip the status: If True, make it False. If False, make it True.
        profile.is_active = not profile.is_active
        profile.save()
        return Response({"status": "Success", "is_active": profile.is_active})
class ActiveDriverListView(APIView):
    def get(self, request):
        # Only show drivers who have clicked "GO LIVE"
        active_drivers = DriverProfile.objects.filter(is_active=True)
        serializer = DriverProfileSerializer(active_drivers, many=True)
        return Response(serializer.data)
class UpdateLocationView(APIView):
    def post(self, request):
        profile = DriverProfile.objects.get(user=request.user)
        profile.current_lat = request.data.get('lat')
        profile.current_lng = request.data.get('lng')
        profile.save()
        return Response({"status": "Location Updated"})
class DriverSetupView(APIView):
    def post(self, request):
        # This endpoint will be used to set up the driver's profile after registration
        if not request.user.is_driver:
            return Response({"error": "User is not registered as a driver."}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = DriverProfileSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({"message": "Driver profile created successfully!", "data": serializer.data}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)