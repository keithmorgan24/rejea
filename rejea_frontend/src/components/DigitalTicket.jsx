import React from 'react';
import { QrCode, MapPin, Calendar, User } from 'lucide-react';

const DigitalTicket = ({ ticketData }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl border-t-8 border-green-600">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-800 italic">REJEA SWIFT</h2>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase">Paid</span>
          </div>

          <div className="space-y-4 border-b border-dashed border-gray-200 pb-6 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Passenger</span>
              <span className="font-bold text-gray-800">{ticketData.passengerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Vehicle / Seat</span>
              <span className="font-bold text-gray-800">{ticketData.vehicleReg} / Seat {ticketData.seatNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400 text-sm">Route</span>
              <span className="font-bold text-gray-800">{ticketData.route}</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
              <QrCode size={120} className="text-gray-800" />
            </div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Ref: {ticketData.transactionId}</p>
          </div>
        </div>
        
        <div className="bg-gray-900 p-4 text-center">
          <button className="text-white font-bold text-sm hover:text-green-400 transition">
            Download PDF Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalTicket;