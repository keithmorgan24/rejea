import base64
from datetime import datetime
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from trips.models import Seat
from .utils import get_access_token 
from .models import RegisterView

class STKPushView(APIView):
    def post(self, request):
        # 1. Get data from the React Modal
        phone = request.data.get('phone') # e.g., 254712345678
        amount = request.data.get('amount')
        
        # 2. Setup Daraja Credentials (Use your .env variables)
        business_short_code = "174379" # Default Sandbox Shortcode
        passkey = settings.MPESA_PASSKEY
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        
        # Generate the Password
        # 
        data_to_encode = business_short_code + passkey + timestamp
        password = base64.b64encode(data_to_encode.encode()).decode('utf-8')
        
        # 3. The Daraja Endpoint & Headers
        api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        headers = {"Authorization": f"Bearer {settings.MPESA_ACCESS_TOKEN}"}
        
        # 4. The Payload (What Safaricom expects)
        payload = {
            "BusinessShortCode": business_short_code,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone,
            "PartyB": business_short_code,
            "PhoneNumber": phone,
            "CallBackURL": "https://a1b2-c3d4.ngrok-free.app/api/payments/callback/"
, 
            "AccountReference": "RejeaProject",
            "TransactionDesc": "Seat Payment"
        }
        response = requests.post(api_url, json=payload, headers=headers)
        return Response(response.json())
@csrf_exempt # Safaricom doesn't have a CSRF token, so we exempt this
def mpesa_callback(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        
        # Check if the payment was successful
        result_code = data['Body']['stkCallback']['ResultCode']
        
        if result_code == 0:
            # Payment Successful!
            # Extract metadata (like the phone number or custom ID you sent)
            metadata = data['Body']['stkCallback']['CallbackMetadata']['Item']
            # Find the transaction amount or receipt number if needed
            
            # Logic: Update the seat status
            # For this to work, you'll pass a 'BillRef' in the STK push
            # Let's assume you find the seat by the User's phone number for now:
            seat = Seat.objects.filter(locked_by__phone_number=..., is_booked=False).first()
            if seat:
                seat.is_booked = True
                seat.locked_at = None # Clear the lock timer
                seat.save()
                
        return JsonResponse({"ResultCode": 0, "ResultDesc": "Success"})
class RegisterView(APIView):
    def post(self, request):
        # This is where you'd handle user registration
        # For simplicity, let's just return a success message
        return Response({"message": "User registered successfully!"})