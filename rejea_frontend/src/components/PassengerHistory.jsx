import React from 'react';
import { MapPin, Calendar, CreditCard, Armchair, ChevronRight, Clock } from 'lucide-react';

const PassengerHistory = ({ historyData }) => {
  // Example data structure based on your Django models
  // const historyData = [
  //   { id: 1, route: "Nairobi - Nakuru", date: "15 Mar 2026", price: "800", seat: "5", reg: "KDL 123X" },
  // ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <h2 className="text-xl font-bold text-white">Your Journeys</h2>
        <span className="text-xs text-zinc-500 font-mono">{historyData?.length || 0} TRIPS</span>
      </div>

      <div className="space-y-4">
        {historyData && historyData.length > 0 ? (
          historyData.map((trip) => (
            <div 
              key={trip.id} 
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 hover:border-zinc-700 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 p-2 rounded-xl">
                    <MapPin size={20} className="text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">{trip.route}</h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock size={12} /> {trip.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-500 font-bold text-lg">KES {trip.price}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Paid via M-Pesa</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Armchair size={16} className="text-zinc-500" />
                  <span className="text-sm font-medium">Seat: <b className="text-white">{trip.seat}</b></span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <CreditCard size={16} className="text-zinc-500" />
                  <span className="text-sm font-medium">Bus: <b className="text-white">{trip.reg}</b></span>
                </div>
              </div>
              
              <button className="w-full mt-4 py-2 text-xs text-zinc-500 hover:text-white flex items-center justify-center gap-1 transition-colors">
                View Receipt <ChevronRight size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
            <Calendar size={40} className="mx-auto text-zinc-700 mb-4" />
            <p className="text-zinc-500">No past journeys found.</p>
            <button className="mt-4 text-green-500 text-sm font-bold">Book your first trip</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerHistory;