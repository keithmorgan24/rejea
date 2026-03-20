import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import api from './api'; // Ensure api.js is in the same folder as App.jsx

// Component Imports
import Login from './components/Login';
import Register from './components/Register';
import VerificationPendingView from './components/VerificationPendingView';
import DriverDash from './components/DriverDash';
import PassengerDash from './components/PassengerDash';
import DriverProfile from './components/DriverProfile';
import PassengerHistory from './components/PassengerHistory';
import Navbar from './components/Navbar';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on page load
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/accounts/profile/');
      setUser(res.data);
    } catch (err) {
      console.error("Session expired");
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Global Logout Function
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (loading) return (
    <div className="h-screen bg-zinc-950 flex items-center justify-center text-green-500 font-black italic">
      LOADING REJEA...
    </div>
  );

  return (
    <Router>
      <div className={`min-h-screen bg-zinc-950 text-zinc-100 ${user ? 'pb-24' : ''}`}>
        <Routes>
          {/* 1. PUBLIC ROUTES: If logged in, redirect to home (/) */}
          <Route path="/login" element={!user ? <Login onLoginSuccess={setUser} /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />

          {/* 2. THE TRAFFIC CONTROLLER (Path: "/")
                 Renders the correct dashboard DIRECTLY to prevent redirect loops */}
          <Route path="/" element={
            !user ? <Navigate to="/login" replace /> : (
              user.user_type === 'driver' ? (
                user.is_verified ? <DriverDash user={user} /> : <VerificationPendingView setUser={setUser} />
              ) : (
                <PassengerDash user={user} />
              )
            )
          } />

          {/* 3. PROTECTED ROUTES */}
          <Route path="/profile" element={
            user ? <DriverProfile user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
          } />
          
          <Route path="/history" element={
            user ? <PassengerHistory /> : <Navigate to="/login" replace />
          } />

          {/* 4. CATCH-ALL */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Show Navbar only if user is logged in */}
        {user && <Navbar userType={user.user_type} />}
      </div>
    </Router>
  );
};

export default App;
