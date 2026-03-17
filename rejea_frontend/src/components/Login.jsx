import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api'; // Ensure this points to your axios instance

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Hit the login endpoint with current formData
      const response = await api.post('/accounts/login/', formData);
      
      // 2. Destructure the data from your Django backend
      const { access, refresh, user_type } = response.data;

      // 3. Store tokens and role in LocalStorage for session persistence
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('username', formData.username);
      localStorage.setItem('user_role', user_type); // Crucial for protecting routes later

      // 4. Smart Redirection based on user type
      console.log(`User authenticated as: ${user_type}`);
      
      if (user_type === 'driver') {
        navigate('/driver-dashboard');
      } else if (user_type === 'passenger') {
        navigate('/passenger-dashboard');
      } else {
        // Default fallback
        navigate('/trips');
      }

    } catch (err) {
      // Improved error messaging
      const message = err.response?.data?.detail || 'Invalid username or password.';
      setError(message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-zinc-100">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter italic">
            REJEA<span className="text-green-600">SWIFT</span>
          </h1>
          <p className="text-zinc-500 font-medium mt-1">Welcome back, please sign in.</p>
        </header>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mb-6 text-sm animate-pulse">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 ml-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
              placeholder="Enter your username"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2 ml-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:ring-2 focus:ring-green-500 focus:bg-white outline-none transition-all"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-transform active:scale-95 ${
              loading ? 'bg-zinc-400 cursor-not-allowed' : 'bg-zinc-900 hover:bg-black'
            }`}
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 text-center">
          <p className="text-zinc-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-green-600 font-bold hover:underline">
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
