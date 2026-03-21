import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import api from '../api'; 

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ADD THIS BACK IN:
  const handleChange = (e) => {
    if (error) setError(''); // Clear error message when user starts typing again
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { username, password } = formData;
      const res = await api.post('/accounts/login/', { username, password });
      
      localStorage.setItem('token', res.data.token);

      if (onLoginSuccess) {
        onLoginSuccess(res.data);
      }

      if (res.data.user_type === 'driver') {
        window.location.href = '/driver-dashboard';
      } else {
        window.location.href = '/passenger-dashboard';
      }

    } catch (err) {
      const msg = err.response?.data?.error || 
                  err.response?.data?.non_field_errors?.[0] || 
                  'Invalid username or password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-[40px] p-10 border border-zinc-800 shadow-2xl">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-black text-white italic tracking-tighter">
            REJEA<span className="text-green-500">SWIFT</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-2">Enter credentials to proceed</p>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-6 text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="text" 
            name="username" 
            className="w-full p-5 bg-zinc-800 border border-zinc-700 rounded-2xl text-white outline-none focus:border-green-500 transition-colors" 
            placeholder="Username" 
            onChange={handleChange} 
            required 
          />
          <input 
            type="password" 
            name="password" 
            className="w-full p-5 bg-zinc-800 border border-zinc-700 rounded-2xl text-white outline-none focus:border-green-500 transition-colors" 
            placeholder="Password" 
            onChange={handleChange} 
            required 
          />
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-5 rounded-2xl font-black text-lg bg-white text-black hover:bg-green-500 hover:text-white transition-all active:scale-95 shadow-xl"
          >
            {loading ? 'AUTHENTICATING...' : 'SIGN IN'}
          </button>
        </form>

        <div className="mt-10 text-center text-xs font-bold text-zinc-600 uppercase tracking-widest">
          No account? <Link to="/register" className="text-green-500 hover:underline">Create profile</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
