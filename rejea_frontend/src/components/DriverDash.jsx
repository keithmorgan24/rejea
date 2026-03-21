import React, { useState, useEffect, useRef } from 'react';
import DriverMap from '../components/DriverMap';
import api from '../api';
import { User, Power, Loader2 } from 'lucide-react';

const DriverDash = ({ user, onUpdateUser }) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    model: '',
    plate_number: '',
    color: '',
  });
  
  const watchId = useRef(null);

  // 1. Vehicle Registration Logic
  const handleRegisterVehicle = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // Sends model, plate_number, and color to your backend
      const res = await api.post('/accounts/register-vehicle/', vehicleData);
      onUpdateUser({ vehicle: res.data });
      alert("Vehicle registered successfully!");
    } catch (err) {
      console.error("Registration failed", err);
      alert("Registration failed. Please check your details and try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 2. GPS Tracking Logic
  const startTracking = () => {
    if ("geolocation" in navigator) {
      watchId.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await api.post('/update-location/', { latitude, longitude });
          } catch (err) {
            console.error("Location sync failed", err);
          }
        },
        (error) => {
          console.error("GPS Error:", error);
          stopTracking();
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

  // 3. Toggle Online/Offline Status
  const toggleStatus = async () => {
    setIsUpdating(true);
    try {
      const res = await api.post('/accounts/toggle-availability/');
      const newStatus = res.data.is_available;
      
      onUpdateUser({ is_available: newStatus });

      if (newStatus) {
        startTracking();
      } else {
        stopTracking();
      }
    } catch (err) {
      console.error("Status update failed", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // GPS Cleanup on unmount or status change
  useEffect(() => {
    if (user.is_available) {
      startTracking();
    }
    return () => stopTracking();
  }, [user.is_available]);

  // VIEW 1: Registration Form (If no vehicle is linked to user)
  if (!user.vehicle) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6 flex flex-col justify-center">
        <section className="max-w-md mx-auto bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl w-full">
          <h2 className="text-2xl font-black mb-6 uppercase tracking-tight text-green-500">Register Vehicle</h2>
          <form onSubmit={handleRegisterVehicle} className="space-y-4">
            <input 
              className="w-full p-4 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-green-500 outline-none transition-all"
              placeholder="Model (e.g. Toyota Vitz)"
              value={vehicleData.model}
              onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
              required
            />
            <input 
              className="w-full p-4 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-green-500 outline-none transition-all"
              placeholder="Plate Number"
              value={vehicleData.plate_number}
              onChange={(e) => setVehicleData({...vehicleData, plate_number: e.target.value})}
              required
            />
            <input 
              className="w-full p-4 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-green-500 outline-none transition-all"
              placeholder="Vehicle Color (e.g. White)"
              value={vehicleData.color}
              onChange={(e) => setVehicleData({...vehicleData, color: e.target.value})}
              required
            />
            <button 
              type="submit"
              disabled={isUpdating}
              className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-xl font-black text-lg transition-all flex justify-center items-center"
            >
              {isUpdating ? <Loader2 className="animate-spin" /> : "COMPLETE REGISTRATION"}
            </button>
          </form>
        </section>
      </div>
    );
  }

  // VIEW 2: Dashboard (If vehicle exists)
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight">Driver Console</h1>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold transition-all ${
          user.is_available ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'
        }`}>
          <span className={`h-2 w-2 rounded-full ${user.is_available ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {user.is_available ? "LIVE" : "OFFLINE"}
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl relative bg-zinc-900 h-80 mb-6">
        <DriverMap onMapLoad={() => setIsMapLoaded(true)} />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <section className={`p-8 rounded-3xl border-2 transition-all duration-500 flex flex-col items-center text-center ${
          user.is_available ? 'border-green-500 bg-green-500/5' : 'border-zinc-800 bg-zinc-900'
        }`}>
          <div className={`w-20 h-20 rounded-full mb-4 flex items-center justify-center border-4 transition-all ${
            user.is_available ? 'border-green-500 scale-110' : 'border-zinc-700'
          }`}>
            <span className="text-3xl">🚗</span>
          </div>
          
          <h2 className="text-xl font-bold">{user.vehicle.model}</h2>
          <p className="text-zinc-500 font-mono text-sm mb-6">
            {user.vehicle.color} • {user.vehicle.plate_number}
          </p>

          <button 
            onClick={toggleStatus}
            disabled={isUpdating}
            className={`w-full py-5 rounded-2xl font-black text-xl transition-all active:scale-95 flex justify-center items-center gap-3 ${
              user.is_available ? 'bg-red-600' : 'bg-green-600 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
            }`}
          >
            {isUpdating ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <Power size={24} />
                {user.is_available ? "GO OFFLINE" : "GO ONLINE"}
              </>
            )}
          </button>
        </section>
      </div>
    </div>
  );
};

export default DriverDash;