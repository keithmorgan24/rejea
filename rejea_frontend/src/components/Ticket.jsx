import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Ticket as TicketIcon, MapPin, Calendar, User, QrCode, Download, Home } from 'lucide-react';

const Ticket = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Data passed from the payment success redirection
  const { ticketData } = location.state || { 
    ticketData: {
      ticketNumber: "REJ-8829-X",
      passenger: localStorage.getItem('username'),
      origin: "Nairobi",
      destination: "Nakuru",
      seat: "A4",
      date: new Date().toLocaleDateString(),
      time: "14:30 PM",
      amount: "2"
    } 
  };

  return (
    <div className="min-h-screen bg-green-600 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden">
        
        {/* Top Section - Success Header */}
        <div className="bg-zinc-900 p-8 text-center text-white">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-900/50">
            <TicketIcon size={32} />
          </div>
          <h2 className="text-2xl font-black italic tracking-tighter">BOOKING CONFIRMED</h2>
          <p className="text-zinc-500 text-xs font-bold mt-2 uppercase tracking-widest">Show this to your driver</p>
        </div>

        {/* Middle Section - Ticket Details */}
        <div className="p-8 space-y-6 relative">
          {/* Decorative side notches to look like a real ticket */}
          <div className="absolute top-0 -left-4 w-8 h-8 bg-green-600 rounded-full"></div>
          <div className="absolute top-0 -right-4 w-8 h-8 bg-green-600 rounded-full"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase">Passenger</p>
              <p className="font-bold text-lg text-zinc-900">{ticketData.passenger}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-zinc-400 uppercase">Ticket No.</p>
              <p className="font-mono font-bold text-zinc-900">{ticketData.ticketNumber}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-4 border-t border-dashed border-zinc-200">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={14} className="text-green-600" />
                <p className="text-[10px] font-black text-zinc-400 uppercase">From</p>
              </div>
              <p className="font-bold text-zinc-900">{ticketData.origin}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={14} className="text-green-600" />
                <p className="text-[10px] font-black text-zinc-400 uppercase">To</p>
              </div>
              <p className="font-bold text-zinc-900">{ticketData.destination}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-zinc-50 p-4 rounded-2xl">
            <div className="text-center">
              <p className="text-[9px] font-black text-zinc-400 uppercase">Seat</p>
              <p className="font-black text-lg text-green-600">{ticketData.seat}</p>
            </div>
            <div className="text-center border-x border-zinc-200">
              <p className="text-[9px] font-black text-zinc-400 uppercase">Date</p>
              <p className="font-bold text-xs pt-1">{ticketData.date}</p>
            </div>
            <div className="text-center">
              <p className="text-[9px] font-black text-zinc-400 uppercase">Time</p>
              <p className="font-bold text-xs pt-1">{ticketData.time}</p>
            </div>
          </div>

          {/* QR Code Placeholder */}
          <div className="flex flex-col items-center py-4">
            <div className="p-4 border-2 border-zinc-100 rounded-3xl mb-2">
              <QrCode size={120} className="text-zinc-900" />
            </div>
            <p className="text-[10px] font-bold text-zinc-400 italic">Scan to verify boarding</p>
          </div>
        </div>

        {/* Footer Section - Actions */}
        <div className="px-8 pb-8 flex gap-3">
          <button 
            onClick={() => window.print()}
            className="flex-1 py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"
          >
            <Download size={18} /> SAVE
          </button>
          <button 
            onClick={() => navigate('/trips')}
            className="flex-1 py-4 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
          >
            <Home size={18} /> DONE
          </button>
        </div>
      </div>
    </div>
  );
};

export default Ticket;