import requests
import base64
from datetime import datetime
from django.conf import settings
from rejea_app.models import Transaction, Seat


def get_access_token():
    """Generates the OAuth token required for Daraja APIs."""
    api_url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
    r = requests.get(api_url, auth=(CONSUMER_KEY, CONSUMER_SECRET))
    return r.json().get('access_token')

def initiate_stk_push(phone_number, amount, seat_id):
    """
    Triggers the STK Push prompt on the user's phone and 
    saves a Transaction record to track the payment.
    """
    access_token = get_access_token()
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    
    # Password is: Base64(ShortCode + PassKey + Timestamp)
    password_str = BUSINESS_SHORTCODE + PASSKEY + timestamp
    password = base64.b64encode(password_str.encode()).decode('utf-8')

    payload = {
        "BusinessShortCode": BUSINESS_SHORTCODE,
        "Password": password,
        "Timestamp": timestamp,
        "TransactionType": "CustomerPayBillOnline",
        "Amount": int(amount),
        "PartyA": phone_number, # Format: 2547XXXXXXXX
        "PartyB": BUSINESS_SHORTCODE,
        "PhoneNumber": phone_number,
        "CallBackURL": CALLBACK_URL,
        "AccountReference": f"Seat-{seat_id}",
        "TransactionDesc": "Seat Booking Payment"
    }

    headers = {"Authorization": f"Bearer {access_token}"}
    api_url = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"

    response = requests.post(api_url, json=payload, headers=headers)
    res_data = response.json()

    # If Safaricom accepted the request (ResponseCode '0')
    if res_data.get('ResponseCode') == '0':
        checkout_id = res_data.get('CheckoutRequestID')
        
        # Create a pending Transaction record to link with the callback later
        seat = Seat.objects.get(id=seat_id)
        Transaction.objects.create(
            checkout_request_id=checkout_id,
            seat=seat,
            amount=amount,
            phone_number=phone_number,
            status='Pending'
        )
        return {"status": "success", "checkout_id": checkout_id}
    
    return {"status": "error", "message": res_data.get('CustomerMessage', 'Failed to initiate')}