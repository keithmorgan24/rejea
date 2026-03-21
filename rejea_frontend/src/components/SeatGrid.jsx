import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Armchair, CircleUser, Info, CheckCircle2, X, Loader2 } from 'lucide-react'; 
import api from '../api';

const SeatGrid = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPolling, setIsPolling] = useState(false); 

  useEffect(() => {
    fetchSeats();
  }, [tripId]);

  // --- AUTOMATIC VERIFICATION LOGIC ---
  useEffect(() => {
    let pollInterval;
    if (isPolling && selectedSeat) {
      pollInterval = setInterval(async () => {
        try {
          const response = await api.get(`/trips/seats/${selectedSeat.id}/status/`);
          if (response.data.is_booked) {
            setIsPolling(false);
            clearInterval(pollInterval);
            alert("Payment Confirmed! Your seat is secured.");
            fetchSeats();
            setSelectedSeat(null);
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 3000);
    }
    return () => clearInterval(pollInterval);
  }, [isPolling, selectedSeat]);

  const fetchSeats = async () => {
    try {
      const response = await api.get(`/trips/bus/${tripId}/seats/`);
      setSeats(response.data);
    } catch (err) {
      console.error("Error loading seats", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    let formattedPhone = phoneNumber;
    if (phoneNumber.startsWith('0')) {
      formattedPhone = '254' + phoneNumber.slice(1);
    } else if (!phoneNumber.startsWith('254')) {
      formattedPhone = '254' + phoneNumber;
    }

    setIsProcessing(true);
    try {
      // 1. Lock the seat
      await api.post('/trips/lock-seat/', { seat_id: selectedSeat.id });

      // 2. Trigger M-Pesa STK Push (Adjust amount/endpoint as needed)
      const res = await api.post('/payments/stk-push/', {
        phone: formattedPhone,
        amount: 800, 
        seat_id: selectedSeat.id
      });
      
      if (res.data.ResponseCode === "0") {
        setIsModalOpen(false); 
        setIsPolling(true);
        alert("STK Push Sent! Enter your PIN.");
      } else {
        alert("M-Pesa error: " + (res.data.CustomerMessage || "Initialization failed"));
      }
    } catch (err) {
      console.error("Booking failed:", err);
      alert("Could not initialize payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 relative">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/trips')} className="mb-6 text-zinc-400 font-bold text-sm hover:text-black transition">
          ← BACK TO TRIPS
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-white rounded-[3rem] p-10 shadow-sm border border-zinc-100">
            <h2 className="text-2xl font-black italic mb-12 uppercase">Select Your Seat</h2>
            
            <div className="grid grid-cols-3 gap-6 max-w-xs mx-auto">
              {seats.map((seat) => (
                <button
                  key={seat.id}
                  disabled={seat.is_booked || seat.is_locked}
                  onClick={() => setSelectedSeat(seat)}
                  className={`relative aspect-square rounded-2xl flex items-center justify-center transition-all ${
                    seat.is_booked || seat.is_locked 
                    ? 'bg-zinc-100 text-zinc-300' 
                    : selectedSeat?.id === seat.id 
                    ? 'bg-green-500 text-white scale-110' 
                    : 'bg-zinc-50 hover:bg-zinc-200'
                  }`}
                >
                  <Armchair size={24} />
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-white border w-5 h-5 rounded-full flex items-center justify-center">
                    {seat.seat_number}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] h-fit">
            <h3 className="text-lg font-bold mb-4">Summary</h3>
            {selectedSeat ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                  <span className="text-zinc-500">Seat</span>
                  <span className="text-2xl font-black">{selectedSeat.seat_number}</span>
                </div>
                <button 
                  disabled={isPolling}
                  onClick={() => setIsModalOpen(true)} 
                  className="w-full py-5 bg-green-600 hover:bg-green-500 rounded-2xl font-black flex items-center justify-center gap-2"
                >
                  {isPolling ? "WAITING..." : "PROCEED TO PAY"} <CheckCircle2 size={20} />
                </button>
              </div>
            ) : (
              <p className="text-sm opacity-50">Select a seat to continue</p>
            )}
          </div>
        </div>
      </div>

      {/* --- PAYMENT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-zinc-800 w-full max-w-sm rounded-[2.5rem] p-8 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white">
              <X size={20} />
            </button>
            <h2 className="text-white text-xl font-black mb-6">M-PESA PAYMENT</h2>
            <input 
              type="text" 
              placeholder="0712345678" 
              className="w-full bg-zinc-800 border-none rounded-xl p-4 text-white mb-4"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <button 
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full py-4 bg-green-600 text-white rounded-xl font-bold flex justify-center"
            >
              {isProcessing ? <Loader2 className="animate-spin" /> : "SEND STK PUSH"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatGrid;
