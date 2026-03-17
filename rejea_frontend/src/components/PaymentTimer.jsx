import React, { useState, useEffect } from 'react';

const PaymentTimer = ({ expiryTime, onExpire }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(expiryTime) - new Date();
    return difference > 0 ? Math.floor(difference / 1000) : 0;
  };

  const [seconds, setSeconds] = useState(calculateTimeLeft());

  useEffect(() => {
    if (seconds <= 0) {
      onExpire(); // Logic to close the modal or refresh seats
      return;
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-orange-100 text-orange-700 p-3 rounded-lg text-center font-bold">
      Complete payment in: <span className="text-xl">{formatTime(seconds)}</span>
    </div>
  );
};

export default PaymentTimer;