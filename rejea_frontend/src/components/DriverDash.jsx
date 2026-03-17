import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { User, Power } from 'lucide-react';

const DriverDash = () => {
  const [isLive, setIsLive] = useState(false);
  const watchId = useRef(null);

  // Toggle both GPS and Database Status
  const toggleStatus = async () => {
    const newStatus = !isLive;
    
    try {
      // 1. Update Database Visibility
      await api.patch('/rejea/vehicle/toggle-status/', { is_active: newStatus });
      
      // 2. Handle GPS Logic
      if (newStatus) {
        startTracking();
      } else {
        stopTracking();
      }
      
      setIsLive(newStatus);
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Connection error. Status not updated.");
    }
  };

  const startTracking = () => {
    if ("geolocation" in navigator) {
      watchId.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await api.post('/accounts/update-location/', {
              lat: latitude,
              lng: longitude
            });
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

  useEffect(() => {
    return () => stopTracking();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {/* Profile Section */}
      <section className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800 mb-6">
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
              {isLive ? "LIVE & BROADCASTING" : "OFFLINE"}
            </h3>
            <p className="text-zinc-400 text-sm">
              {isLive ? "Passengers can see your location" : "You are hidden from the map"}
            </p>
          </div>
          <button 
            onClick={toggleStatus}
            className={`p-4 rounded-full transition-transform active:scale-90 ${
              isLive ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]' : 'bg-zinc-700'
            }`}
          >
            <Power size={28} color={isLive ? "black" : "white"} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default DriverDash;
