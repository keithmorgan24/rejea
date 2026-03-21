import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { Car, MapPin, Loader2, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 1. ADD THIS IMPORT

// Helper function to calculate distance (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lat2 || !lon1 || !lon2) return "??";
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); 
};

const PassengerDash = () => {
  const navigate = useNavigate(); // 2. INITIALIZE NAVIGATION
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLoc, setUserLoc] = useState({ lat: null, lng: null });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn("Location access denied."),
      { enableHighAccuracy: true }
    );
  }, []);

  const fetchDrivers = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await api.get('/accounts/active-drivers/');
      setDrivers(res.data);
    } catch (err) {
      console.error("Refresh failed", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(() => fetchDrivers(false), 15000);
    return () => clearInterval(interval);
  }, [fetchDrivers]);

  // 3. BOOKING HANDLER
  const handleBookingClick = (tripId) => {
    if (!tripId) {
      alert("This driver hasn't started a trip yet.");
      return;
    }
    // Navigate to your SeatGrid component route
    navigate(`/seat-selection/${tripId}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans">
      <header className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-green-500">
            REJEA RIDES
          </h1>
          <div className="flex items-center gap-2 text-zinc-500 text-sm">
            <MapPin size={14} className="text-green-500" />
            <span>Showing drivers near you</span>
          </div>
        </div>
        {refreshing && <Loader2 className="animate-spin text-green-500" size={20} />}
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-green-500" size={40} />
          <p className="text-zinc-500 font-bold animate-pulse uppercase tracking-widest text-xs">Scanning for vehicles...</p>
        </div>
      ) : drivers.length > 0 ? (
        <div className="space-y-4">
          {drivers.map((driver) => {
            const dist = calculateDistance(
              userLoc.lat, userLoc.lng, 
              driver.current_lat, driver.current_lng
            );

            return (
              <div key={driver.id} className="bg-zinc-900 p-5 rounded-3xl border border-zinc-800 flex justify-between items-center transition-all hover:border-zinc-700 active:scale-95">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500/10 p-4 rounded-2xl text-green-500">
                    <Car size={28} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{driver.model || "Vehicle"}</h3>
                    <p className="text-xs text-zinc-500 font-mono uppercase tracking-wider mb-1">
                      {driver.plate || "No Plate"}
                    </p>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-black uppercase">
                        {driver.capacity || 14} Seater
                      </span>
                      <span className="text-green-500 text-xs font-black flex items-center gap-1">
                        <Navigation size={10} fill="currentColor" /> {dist} KM
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* 4. ATTACH THE CLICK HANDLER TO THE BUTTON */}
                <button 
                  onClick={() => handleBookingClick(driver.trip_id)}
                  className="bg-white text-black px-5 py-3 rounded-2xl font-black text-xs hover:bg-green-500 transition-colors uppercase"
                >
                  Book
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-10 bg-zinc-900 rounded-3xl border-2 border-dashed border-zinc-800">
          <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="text-zinc-600" size={24} />
          </div>
          <p className="text-zinc-500 font-bold text-sm">No active drivers found in your area.</p>
          <button 
            onClick={() => fetchDrivers(true)}
            disabled={refreshing}
            className="mt-4 text-green-500 text-xs font-black uppercase tracking-widest hover:text-green-400 transition-all disabled:opacity-50"
          >
            {refreshing ? "Refreshing..." : "Tap to refresh"}
          </button>
        </div>
      )}
    </div>
  );
};

export default PassengerDash;
