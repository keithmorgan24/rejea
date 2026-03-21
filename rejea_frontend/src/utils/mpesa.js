import api from '../api';

/**
 * Calls your Django backend to trigger the M-Pesa STK Push
 * @param {string} phone - User's phone (e.g. 0712345678)
 * @param {number} amount - Trip price
 * @param {string} tripId - For reference
 */
export const triggerMpesaPayment = async (phone, amount, tripId) => {
  try {
    const response = await api.post('/rejea/payments/initiate/', {
      phone_number: phone,
      amount: amount,
      trip_id: tripId
    });
    return response.data;
  } catch (error) {
    console.error("M-Pesa Trigger Failed:", error.response?.data || error.message);
    throw error;
  }
};