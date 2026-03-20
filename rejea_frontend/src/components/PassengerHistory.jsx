import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import the navigation hook
import { MapPin, Calendar, CreditCard, Armchair, ChevronRight, Clock } from 'lucide-react';

const PassengerHistory = ({ historyData }) => {
  const navigate = useNavigate(); // 2. Initialize the navigate function

  return (
    <div className="space-y-6 pb-24"> {/* Added padding for navbar visibility */}
      <div className="flex items-center justify-between px-2 pt-4">
        <h2 className="text-2xl font-black text-white italic tracking-tighter">YOUR JOURNEYS</h2>
        <span className="text-[10px] font-bold text-zinc-600 bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 tracking-widest">
          {historyData?.length || 0} TRIPS
        </span>
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
          /* --- EMPTY STATE --- */
          <div className="flex flex-col items-center justify-center py-24 bg-zinc-900/30 rounded-[40px] border-2 border-dashed border-zinc-900">
            <div className="bg-zinc-900 p-6 rounded-full mb-6">
              <Calendar size={48} className="text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 text-center px-6">No past journeys found.</h3>
            <p className="text-zinc-500 text-center text-sm max-w-60 mb-8 leading-relaxed">
              Your travel history is empty. Start moving with the fleet today.
            </p>
            
            {/* 3. FIXED BUTTON: Added onClick to go back to Home */}
            <button 
              onClick={() => navigate('/')} 
              className="bg-white hover:bg-green-500 text-black px-8 py-4 rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-green-500/5 flex items-center gap-2"
            >
              Book your first trip
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassengerHistory;
