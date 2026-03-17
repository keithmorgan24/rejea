const handlePayment = async () => {
  // 1. Format the number automatically
  let formattedPhone = phoneNumber;
  if (phoneNumber.startsWith('0')) {
    formattedPhone = '254' + phoneNumber.slice(1);
  } else if (!phoneNumber.startsWith('254')) {
    formattedPhone = '254' + phoneNumber;
  }

  setIsProcessing(true);
  try {
    // 2. Send the POST request to your Django API
    const response = await api.post('/payments/stk-push/', {
      phone: formattedPhone,
      amount: amount,
      seat_id: seatId // Pass the ID so the backend knows which seat to book
    });

    if (response.data.ResponseCode === "0") {
      alert("STK Push sent! Please enter your PIN on your phone.");
    }
  } catch (err) {
    console.error("Payment Error:", err.response?.data);
    alert("Could not trigger M-Pesa. Check your internet or phone number.");
  } finally {
    setIsProcessing(false);
  }
};
{isLocked && (
  <PaymentTimer 
    expiryTime={lockData.expires_at} 
    onExpire={() => {
      alert("Session expired! Please select the seat again.");
      closeModal();
    }} 
  />
)}