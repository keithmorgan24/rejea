import React, { useState } from 'react';
import api from '../api';

const SeatPicker = ({ seatId, number, available }) => {
  const [status, setStatus] = useState(available ? 'available' : 'taken');

  const handleSelect = async () => {
    try {
      const res = await api.post(`/trips/lock-seat/${seatId}/`);
      if (res.data.status === 'locked') {
        setStatus('selected');
        alert("Success! Pay via M-Pesa in the next 5 minutes.");
      }
    } catch (err) {
      alert("Too slow! Someone else just grabbed that seat.");
      setStatus('taken');
    }
  };

  return (
    <button 
      onClick={handleSelect}
      disabled={status === 'taken'}
      className={`w-12 h-12 rounded-lg font-bold border-2 ${
        status === 'available' ? 'border-green-500 text-green-600 hover:bg-green-50' : 
        status === 'selected' ? 'bg-green-600 border-green-600 text-white' : 
        'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed'
      }`}
    >
      {number}
    </button>
  );
};