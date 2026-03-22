import React, { useState, useEffect, useRef } from 'react';
import DriverMap from '../components/DriverMap';
import api from '../api';
import { Power, Loader2, Truck, Users } from 'lucide-react';

const DriverDash = ({ user, onUpdateUser }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [loadingVehicle, setLoadingVehicle] = useState(!user.vehicle);
  
  const [vehicleData, setVehicleData] = useState({
    model: '',
    plate_number: '',
    color: '',
    total_seats: 14,
  });
  
  const watchId = useRef(null);

  // 1. FETCH VEHICLE ON MOUNT
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!user.vehicle) {
        try {
          const res = await api.get('/accounts/driver-profile/'); 
          if (res.data.vehicle) {
            onUpdateUser({ ...user, vehicle: res.data.vehicle });
          }
        } catch (err) {
          console.error("Could not fetch vehicle details", err);
        } finally {
          setLoadingVehicle(false);
        }
      }
    };
    fetchVehicle();
  }, [user.vehicle, onUpdateUser, user]);

  /**
   * GPS TRACKING LOGIC
   */
  const stopTracking = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  const startTracking = () => {
    if (watchId.current) return;

    if ("geolocation" in navigator) {
      watchId.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await api.post('/update-location/', { 
              latitude: latitude.toFixed(6), 
              longitude: longitude.toFixed(6) 
            });
          } catch (err) {
            console.error("Location sync failed", err);
          }
        },
        (error) => {
          console.error("GPS Error:", error);
          stopTracking();
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
      );
    }
  };

  // Sync tracking status with the user.is_available prop
  useEffect(() => {
    if (user.is_available) {
      startTracking();
    } else {
      stopTracking();
    }
    return () => stopTracking();
  }, [user.is_available]);

  /**
   * HANDLERS
   */
  const handleRegisterVehicle = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await api.post('/accounts/register-vehicle/', vehicleData);
      const newVehicle = res.data.vehicle || res.data;
      onUpdateUser({ ...user, vehicle: newVehicle });
      alert("Vehicle registered successfully!");
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err);
      alert("Registration failed. Please check your details.");
    } finally {
      setIsUpdating(false);
    }
  };

  const toggleStatus = async () => {
    setIsUpdating(true);
    try {
      const res = await api.post('/accounts/toggle-availability/');
      onUpdateUser({ ...user, is_available: res.data.is_available });
    } catch (err) {
      console.error("Status update failed", err);
      alert("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // UI RENDERING
  if (loadingVehicle) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <Loader2 className="animate-spin mr-2" /> Loading Profile...
      </div>
    );
  }

  // VIEW 1: REGISTRATION FORM
  if (!user.vehicle) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white p-6 flex flex-col justify-center">
        <section className="max-w-md mx-auto bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl w-full">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="text-green-500" size={32} />
            <h2 className="text-2xl font-black uppercase tracking-tight text-white">Register Vehicle</h2>
          </div>
          
          <form onSubmit={handleRegisterVehicle} className="space-y-4">
            <input 
              className="w-full p-4 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-green-500 outline-none transition-all"
              placeholder="Model (e.g. Toyota Hiace)"
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
            <div className="grid grid-cols-2 gap-4">
               <input 
                className="w-full p-4 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-green-500 outline-none transition-all"
                placeholder="Color"
                value={vehicleData.color}
                onChange={(e) => setVehicleData({...vehicleData, color: e.target.value})}
                required
              />
              <div className="relative">
                <Users className="absolute right-4 top-4 text-zinc-600" size={18} />
                <input 
                  type="number"
                  className="w-full p-4 bg-zinc-800 rounded-xl border border-zinc-700 focus:border-green-500 outline-none transition-all"
                  placeholder="Seats"
                  value={vehicleData.total_seats}
                  onChange={(e) => setVehicleData({...vehicleData, total_seats: parseInt(e.target.value) || 0})}
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              disabled={isUpdating}
              className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-xl font-black text-lg transition-all flex justify-center items-center shadow-lg shadow-green-900/20"
            >
              {isUpdating ? <Loader2 className="animate-spin" /> : "COMPLETE REGISTRATION"}
            </button>
          </form>
        </section>
      </div>
    );
  }

  // VIEW 2: ACTIVE DASHBOARD
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 font-sans">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight">Driver Console</h1>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold transition-all ${
          user.is_available ? 'bg-green-500/10 border-green-500 text-green-500' : 'bg-red-500/10 border-red-500 text-red-500'
        }`}>
          <span className={`h-2 w-2 rounded-full ${user.is_available ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          {user.is_available ? "LIVE SESSION" : "OFFLINE"}
        </div>
      </div>

      <div className="rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl relative bg-zinc-900 h-80 mb-6">
        <DriverMap />
      </div>

      <section className={`p-8 rounded-3xl border-2 transition-all duration-500 flex flex-col items-center text-center ${
        user.is_available ? 'border-green-500 bg-green-500/5' : 'border-zinc-800 bg-zinc-900'
      }`}>
        <h3 className="text-xl font-bold mb-1">{user.vehicle?.model}</h3>
        <p className="text-zinc-500 text-sm mb-6">{user.vehicle?.plate_number} • {user.vehicle?.color}</p>
        
        <button 
          onClick={toggleStatus}
          disabled={isUpdating}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
            user.is_available 
            ? 'bg-red-600 hover:bg-red-500 shadow-red-900/20' 
            : 'bg-green-600 hover:bg-green-500 shadow-green-900/20'
          }`}
        >
          {isUpdating ? <Loader2 className="animate-spin" /> : <Power size={32} />}
        </button>
        <p className="mt-4 font-bold text-xs tracking-widest uppercase">
          {user.is_available ? "Go Offline" : "Go Online"}
        </p>
      </section>
    </div>
  );
};

export default DriverDash;
