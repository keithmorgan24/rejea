import requests
import base64
from datetime import datetime
from django.conf import settings

def generate_mpesa_token():
    """Generates the OAuth2 access token for Daraja"""
    api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    keys = f"{settings.MPESA_CONSUMER_KEY}:{settings.MPESA_CONSUMER_SECRET}"
    encoded_keys = base64.b64encode(keys.encode()).decode()
    
    headers = {"Authorization": f"Basic {encoded_keys}"}
    res = requests.get(api_url, headers=headers)
    return res.json().get('access_token')

def initiate_stk_push(phone, amount, reference):
    """Sends the STK Push prompt to the user's phone"""
    access_token = generate_mpesa_token()
    api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"
    
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    password_str = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
    password = base64.b64encode(password_str.encode()).decode()

    # Format phone to 254...
    if phone.startswith('0'):
        phone = '254' + phone[1:]

    payload = {
        "BusinessShortCode": settings.MPESA_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone,
        "PartyB": settings.MPESA_SHORTCODE,
        "PhoneNumber": phone,
        "CallBackURL": "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        "AccountReference": reference,
        "TransactionDesc": f"Seat Booking {reference}"
    }

    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.post(api_url, json=payload, headers=headers)
    return response.json()