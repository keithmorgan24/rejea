import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// FIX: Change 'lucide-center' back to 'lucide-react'
import { MapPin, ChevronRight, LogOut, CreditCard } from 'lucide-react';
import api from '../api';

const Trips = () => {
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Traveler';

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        // This should now match your Django backend: http://127.0.0.1
        const response = await api.get('trips/available/'); 
        setTrips(response.data);
      } catch (err) {
        console.error("Failed to fetch trips", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <nav className="bg-white border-b border-zinc-100 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-black italic tracking-tighter text-zinc-900">REJEA SWIFT</h1>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Nairobi Terminal</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-zinc-900">Hello, {username}</p>
            <p className="text-xs text-green-600 font-medium">Verified Account</p>
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <LogOut size={20} className="text-zinc-400" />
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <header>
            <h2 className="text-2xl font-black text-zinc-900">Available Journeys</h2>
            <p className="text-zinc-500">Select a trip to view available seating.</p>
          </header>

          {loading ? (
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-zinc-200 rounded-3xl" />)}
            </div>
          ) : (
            <div className="grid gap-4">
              {trips.length > 0 ? (
                trips.map((trip) => (
                  <div 
                    key={trip.id}
                    onClick={() => setSelectedTrip(trip)}
                    className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-center gap-4 ${
                      selectedTrip?.id === trip.id 
                      ? 'border-green-600 bg-white shadow-xl scale-[1.02]' 
                      : 'border-transparent bg-white hover:border-zinc-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-zinc-100 p-4 rounded-2xl">
                        <MapPin className="text-zinc-900" size={24} />
                      </div>
                      <div>
                        <h4 className="font-black text-lg text-zinc-900">{trip.origin} to {trip.destination}</h4>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
                            Departs: {trip.departure_time}
                          </span>
                          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            {trip.bus_type || 'Standard'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div>
                        <p className="text-xs font-bold text-zinc-400 uppercase">Fare</p>
                        <p className="text-xl font-black text-zinc-900">KES {trip.price}</p>
                      </div>
                      <ChevronRight className={selectedTrip?.id === trip.id ? 'text-green-600' : 'text-zinc-300'} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-zinc-200">
                  <p className="text-zinc-400 font-medium">No trips currently available.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white sticky top-24 shadow-2xl overflow-hidden">
            {selectedTrip ? (
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-6">Reservation Details</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-sm border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500 font-medium">Route</span>
                    <span className="font-bold">{selectedTrip.destination}</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500 font-medium">Bus Plate</span>
                    <span className="font-bold">{selectedTrip.bus_plate || 'KDH 123X'}</span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/checkout/${selectedTrip.id}`)}
                  className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <CreditCard size={20} /> SELECT SEATS
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="bg-zinc-800 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MapPin className="text-zinc-600" />
                </div>
                <p className="text-zinc-400 font-medium px-4">Choose a journey from the list to start booking.</p>
              </div>
            )}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-600 rounded-full blur-[80px] opacity-20"></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Trips;
