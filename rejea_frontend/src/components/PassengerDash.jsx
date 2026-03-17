import React, { useEffect, useState } from 'react';
import api from '../api';
import { Car, Clock, MapPin } from 'lucide-react';

// Helper function to calculate distance (Haversine formula placeholder)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lat2) return "??";
  // Simplified calculation for demo; consider a library for production
  const R = 6371; // Radius of earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); 
};

const PassengerDash = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mock user location (Replace this with navigator.geolocation later)
  const [userLoc] = useState({ lat: -1.286389, lng: 36.817223 }); 

  const fetchVehicles = async () => {
    try {
      const response = await api.get('/accounts/active-drivers/');
      setVehicles(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    const interval = setInterval(fetchVehicles, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Swift PSVs</h1>
          <p className="text-gray-500">Real-time availability in your area</p>
        </header>

        {loading ? (
          <p className="text-center text-green-600 font-bold">Searching for vehicles...</p>
        ) : vehicles.length > 0 ? (
          <div className="space-y-4">
            {vehicles.map((v) => {
              // Calculate distance INSIDE the map function
              const dist = calculateDistance(userLoc.lat, userLoc.lng, v.current_lat, v.current_lng);
              
              return (
                <div key={v.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-center transition hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                      <Car size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{v.vehicle_reg}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock size={14} /> 14-Seater • <span className="text-green-600 font-medium">{dist} KM away</span>
                      </p>
                    </div>
                  </div>
                  <button className="bg-gray-900 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-600 transition">
                    Check Status
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-10 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">No active PSVs found right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerDash;
