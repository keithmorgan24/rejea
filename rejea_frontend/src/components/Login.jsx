import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api'; 

// Destructure onLoginSuccess from props
const Login = ({ onLoginSuccess }) => {
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
      // 1. Send login request
      const response = await api.post('/accounts/login/', formData);
      
      // 2. Extract data (Assuming your backend returns { token, user_type, is_verified, ... })
      // Note: We need the full user object to satisfy the App.jsx logic
      const { token, user_type } = response.data;

      // 3. Store in LocalStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user_role', user_type);
      localStorage.setItem('username', formData.username);

      // 4. Update the App state so App.jsx "knows" we are logged in
      // We pass the entire response.data (or wherever your user info is)
      if (onLoginSuccess) {
        onLoginSuccess(response.data); 
      }

      console.log("Login successful, redirecting via App controller...");
      
      // 5. Navigate to root - App.jsx's Traffic Controller will handle the rest!
      navigate('/');

    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.detail || 'Invalid username or password.';
      setError(message);
      console.error('Login Error:', err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl shadow-2xl p-8 border border-zinc-800">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-black text-white tracking-tighter italic">
            REJEA<span className="text-green-500">SWIFT</span>
          </h1>
          <p className="text-zinc-400 font-medium mt-1">Welcome back, please sign in.</p>
        </header>

        {error && (
          <div className="bg-red-900/20 border-l-4 border-red-500 text-red-400 p-4 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="Enter your username"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              className="w-full p-4 bg-zinc-800 border border-zinc-700 text-white rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
              placeholder="••••••••"
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-bold text-lg text-white shadow-lg transition-transform active:scale-95 ${
              loading ? 'bg-zinc-700 cursor-not-allowed' : 'bg-white text-zinc-950 hover:bg-zinc-200'
            }`}
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-zinc-500 text-sm">
            Don't have an account? <Link to="/register" className="text-green-500 font-bold hover:underline">Create one here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
