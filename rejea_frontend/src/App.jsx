import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api';

// Authentication & Onboarding
import Login from './components/Login';
import Register from './components/Register';
import VerificationPendingView from './components/VerificationPendingView';

// Dashboards
import DriverDash from './components/DriverDash';
import PassengerDash from './components/PassengerDash';

// Profile & History
import DriverProfile from './components/DriverProfile';
import PassengerHistory from './components/PassengerHistory';
import SeatGrid from './components/SeatGrid';

// Navigation
import Navbar from './components/Navbar';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Session Persistence: Check if user is logged in on refresh
  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const res = await api.get('/accounts/profile/');
        setUser(res.data);
      } catch (err) {
        console.error("Session expired or invalid");
        localStorage.removeItem('token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // 2. Helper to update user state immediately after Login.jsx succeeds
  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-500"></div>
    </div>
  );

  return (
    <Router>
      <div className={`min-h-screen bg-zinc-950 text-zinc-100 ${user ? 'pb-24' : ''}`}>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          {/* We pass handleLoginSuccess here so Login.jsx can update the 'user' state */}
          <Route 
            path="/login" 
            element={!user ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register /> : <Navigate to="/" />} 
          />

          {/* --- CENTRAL TRAFFIC CONTROLLER --- */}
          <Route path="/" element={
            user ? (
              user.user_type === 'driver' ? (
                user.is_verified ? <Navigate to="/driver-dashboard" /> : <Navigate to="/pending" />
              ) : (
                <Navigate to="/passenger-dashboard" />
              )
            ) : (
              <Navigate to="/login" />
            )
          } />

          {/* --- DRIVER ROUTES --- */}
          <Route path="/driver-dashboard" element={
            user?.user_type === 'driver' && user.is_verified 
            ? <DriverDash user={user} /> 
            : <Navigate to="/" />
          } />

          <Route path="/pending" element={
            user?.user_type === 'driver' && !user.is_verified 
            ? <VerificationPendingView setUser={setUser} /> 
            : <Navigate to="/" />
          } />

          {/* --- PASSENGER ROUTES --- */}
          <Route path="/passenger-dashboard" element={
            user?.user_type === 'passenger' ? <PassengerDash user={user} /> : <Navigate to="/" />
          } />

          <Route path="/trips/:tripId/seats" element={
            user ? <SeatGrid /> : <Navigate to="/login" />
          } />

          <Route path="/history" element={
            user?.user_type === 'passenger' ? <PassengerHistory /> : <Navigate to="/" />
          } />

          {/* --- SHARED PROFILE ROUTE --- */}
          <Route path="/profile" element={
            user ? <DriverProfile user={user} /> : <Navigate to="/login" />
          } />

          {/* Catch-all for 404s */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Persistent Bottom Navbar */}
        {user && <Navbar userType={user.user_type} />}
      </div>
    </Router>
  );
};

export default App;
