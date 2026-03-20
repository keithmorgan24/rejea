import React, { useState, useEffect, useRef } from 'react';
import DriverMap from '../components/DriverMap';
import api from '../api';
import { User, Power, Loader2 } from 'lucide-react';

const DriverDash = () => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // To show loading on the button
  const watchId = useRef(null);

  // Cleanup GPS on unmount
  useEffect(() => {
    return () => stopTracking();
  }, []);

  const startTracking = () => {
    if ("geolocation" in navigator) {
      watchId.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await api.post('/update-location/', {  latitude: latitude,
  longitude: longitude });
          } catch (err) {
            console.error("Location sync failed", err);
          }
        },
        (error) => {
          console.error("GPS Error:", error);
          stopTracking();
          setIsLive(false);
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }
  };

  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  const toggleStatus = async () => {
    setIsUpdating(true);
    const newStatus = !isLive;
    try {
      // PATH MUST MATCH: path('rejea/vehicle/toggle-status/', ...) in urls.py
       await api.patch('/accounts/toggle-status/', { is_active: newStatus });
      
      setIsLive(newStatus);
      if (newStatus) {
        startTracking();
      } else {
        stopTracking();
      }
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Connection error. Ensure your backend matches the URL path.");
    } finally {
      setIsUpdating(false);
    }
  }; // <--- Fixed missing brace here

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans">
      
      {/* Header with Map Status Badge */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight">Driver Console</h1>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold transition-all duration-500 ${
          isMapLoaded ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'
        }`}>
          <span className={`h-2 w-2 rounded-full ${isMapLoaded ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {isMapLoaded ? "SYSTEM ACTIVE" : "AWAITING GPS"}
        </div>
      </div>
      
      {/* Map Section */}
      <div className="mb-10 rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl relative bg-zinc-900 h-100">
        <DriverMap onMapLoad={() => setIsMapLoaded(true)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Section */}
        <section className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="bg-green-500/10 p-4 rounded-full">
              <User className="text-green-500" size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Driver Profile</h2>
              <p className="text-zinc-400 text-sm font-mono">Verified Operator</p>
            </div>
          </div>
        </section>

        {/* Status Toggle Card */}
        <section className={`p-6 rounded-3xl border-2 transition-all duration-500 ${
          isLive ? 'border-green-500 bg-green-500/5' : 'border-zinc-800 bg-zinc-900'
        }`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold">
                {isLive ? "LIVE & BROADCASTING" : "GO ONLINE"}
              </h3>
              <p className="text-zinc-400 text-sm">
                {isLive ? "Passengers see your location" : "You are hidden from the map"}
              </p>
            </div>
            <button 
              onClick={toggleStatus}
              disabled={isUpdating}
              className={`p-4 rounded-full transition-all active:scale-90 disabled:opacity-50 ${
                isLive ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-zinc-700 hover:bg-zinc-600'
              }`}
            >
              {isUpdating ? (
                <Loader2 className="animate-spin text-white" size={28} />
              ) : (
                <Power size={28} className={isLive ? "text-black" : "text-white"} />
              )}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default DriverDash;
