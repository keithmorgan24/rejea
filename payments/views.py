# payments/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import base64
import requests
from requests.auth import HTTPBasicAuth
from datetime import datetime
import json
from rejea_app.models import Seat
from rest_framework.authentication import TokenAuthentication


def get_mpesa_access_token():
    # FIXED: The URL must include the query parameter exactly like this
    url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    
    try:
        res = requests.get(
            url, 
            auth=HTTPBasicAuth(settings.MPESA_CONSUMER_KEY, settings.MPESA_CONSUMER_SECRET),
            timeout=10
        )
        if res.status_code == 200:
            return res.json().get('access_token')
        
        # This will print the REAL reason for the 404/401 in your terminal
        print(f"M-PESA AUTH ERROR {res.status_code}: {res.text}")
        return None
    except Exception as e:
        print(f"M-PESA CONNECTION ERROR: {e}")
        return None

class STKPushView(APIView):
    authentication_classes = [TokenAuthentication] # Explicitly add this
    permission_classes = [IsAuthenticated]
    def post(self, request):
        # 1. Get Token first
        token = get_mpesa_access_token()
        if not token:
            # Prevent the 500 crash by returning a clean error to React
            return Response({"error": "Safaricom Auth Failed. Check your Consumer Key/Secret."}, status=401)

        # 2. Setup Data
        phone = request.data.get('phone')
        amount = request.data.get('amount', 2)
        seat_id = request.data.get('seat_id')
        
        business_short_code = "174379"
        passkey = settings.MPESA_PASSKEY
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode((business_short_code + passkey + timestamp).encode()).decode('utf-8')

        # 3. Call STK Push (FIXED URL)
        api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
        headers = {"Authorization": f"Bearer {token}"}
        payload = {
            "BusinessShortCode": business_short_code,
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone,
            "PartyB": business_short_code,
            "PhoneNumber": phone,
            "CallBackURL": "https://unsinewed-dumpily-muriel.ngrok-free.dev", 
            "AccountReference": f"Seat_{seat_id}",
            "TransactionDesc": f"Seat Booking"
        }

        response = requests.post(api_url, json=payload, headers=headers)
        return Response(response.json())


class MpesaCallbackView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        data = request.data # DRF handles JSON parsing automatically
        # Add your business logic here to mark seat as booked
        return Response({"ResultCode": 0, "ResultDesc": "Success"})
