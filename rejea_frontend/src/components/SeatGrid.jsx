import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Armchair, SteeringWheel, Info, CheckCircle2 } from 'lucide-react';
import api from '../api';

const SeatGrid = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeats();
  }, [tripId]);

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

  const handleLockSeat = async () => {
    if (!selectedSeat) return;
    
    try {
      // Hits your 'api/trips/lock-seat/' endpoint
      await api.post('/trips/lock-seat/', { seat_id: selectedSeat.id });
      // On success, move to payment
      navigate(`/payment/${selectedSeat.id}`);
    } catch (err) {
      alert(err.response?.data?.error || "Could not lock seat");
      fetchSeats(); // Refresh to see updated availability
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/trips')} className="mb-6 text-zinc-400 font-bold text-sm hover:text-black transition">
          ← BACK TO TRIPS
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* The Bus Layout */}
          <div className="md:col-span-2 bg-white rounded-[3rem] p-10 shadow-sm border border-zinc-100">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-2xl font-black italic">SELECT YOUR SEAT</h2>
              <div className="bg-zinc-900 p-2 rounded-lg text-white">
                <SteeringWheel size={24} />
              </div>
            </div>

            {/* Seat Map Legend */}
            <div className="flex gap-6 mb-10 justify-center text-[10px] font-black uppercase tracking-widest">
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-zinc-100 rounded-sm"></div> Available</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-zinc-900 rounded-sm"></div> Occupied</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Selected</div>
            </div>

            {/* Grid for 14-seater (3 columns wide) */}
            <div className="grid grid-cols-3 gap-6 max-w-xs mx-auto">
              {seats.map((seat) => (
                <button
                  key={seat.id}
                  disabled={seat.is_booked || seat.is_locked}
                  onClick={() => setSelectedSeat(seat)}
                  className={`
                    relative aspect-square rounded-2xl flex items-center justify-center transition-all duration-300
                    ${seat.is_booked || seat.is_locked 
                      ? 'bg-zinc-100 text-zinc-300 cursor-not-allowed' 
                      : selectedSeat?.id === seat.id 
                        ? 'bg-green-500 text-white shadow-lg shadow-green-200 scale-110' 
                        : 'bg-zinc-50 text-zinc-900 hover:bg-zinc-200'}
                  `}
                >
                  <Armchair size={24} />
                  <span className="absolute -top-2 -right-2 text-[10px] font-bold bg-white border border-zinc-100 w-5 h-5 rounded-full flex items-center justify-center text-zinc-900">
                    {seat.seat_number}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Checkout Action Card */}
          <div className="space-y-4">
            <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem] shadow-2xl">
              <h3 className="text-lg font-bold mb-4">Summary</h3>
              {selectedSeat ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-zinc-800 pb-4">
                    <span className="text-zinc-500">Seat Number</span>
                    <span className="text-2xl font-black">{selectedSeat.seat_number}</span>
                  </div>
                  <div className="bg-zinc-800 p-4 rounded-2xl flex items-start gap-3">
                    <Info size={16} className="text-green-500 mt-1" />
                    <p className="text-xs text-zinc-400">This seat will be reserved for 10 minutes once you proceed to payment.</p>
                  </div>
                  <button 
                    onClick={handleLockSeat}
                    className="w-full py-5 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2"
                  >
                    PROCEED TO PAY <CheckCircle2 size={20} />
                  </button>
                </div>
              ) : (
                <div className="text-center py-10 opacity-50">
                  <Armchair size={48} className="mx-auto mb-4" />
                  <p className="text-sm">Please tap a seat to see details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatGrid;