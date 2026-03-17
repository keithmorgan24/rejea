import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, User, Truck } from 'lucide-react';
import api from '../api';


const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'passenger' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/accounts/register/', formData);
      navigate('/'); 
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Branding Side */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 flex-col justify-between p-12">
        <h1 className="text-white text-3xl font-black italic tracking-tighter">REJEA SWIFT</h1>
        <div className="text-white">
          <h2 className="text-6xl font-extrabold mb-6 leading-tight">Travel better. <br/> Pay faster.</h2>
          <p className="text-zinc-500 text-xl">The future of Kenyan transport, powered by M-Pesa.</p>
        </div>
        <div className="flex items-center gap-3 text-zinc-600 text-sm font-medium">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Secure Daraja API Integration Active
        </div>
      </div>

      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h3 className="text-3xl font-bold text-zinc-900 mb-2">Create Account</h3>
            <p className="text-zinc-500">Join the Rejea ecosystem today.</p>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            {/* FIXED Role Switcher */}
            <div className="flex bg-zinc-100 p-1.5 rounded-2xl gap-2 shadow-inner border border-zinc-200">
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'passenger'})}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black transition-all duration-300 ${
                  formData.role === 'passenger' 
                  ? 'bg-green-600 text-white shadow-lg scale-100' 
                  : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <User size={18} strokeWidth={3} /> PASSENGER
              </button>
              
              <button
                type="button"
                onClick={() => setFormData({...formData, role: 'driver'})}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black transition-all duration-300 ${
                  formData.role === 'driver' 
                  ? 'bg-zinc-900 text-white shadow-lg scale-100' 
                  : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                <Truck size={18} strokeWidth={3} /> DRIVER
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                name="username"
                value={formData.username}
                placeholder="Username"
                className="w-full p-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl outline-none focus:border-green-600 focus:bg-white transition-all"
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                placeholder="M-Pesa Number (254...)"
                className="w-full p-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl outline-none focus:border-green-600 focus:bg-white transition-all"
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                placeholder="Email Address"
                className="w-full p-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl outline-none focus:border-green-600 focus:bg-white transition-all"
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                value={formData.password}
                placeholder="Password"
                className="w-full p-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl outline-none focus:border-green-600 focus:bg-white transition-all"
                onChange={handleChange}
                required
              />
            </div>

            {/* TOGGLE button color based on role */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 text-white rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-[0.97] disabled:bg-zinc-200 ${
                formData.role === 'passenger' ? 'bg-green-600 hover:bg-green-700' : 'bg-zinc-900 hover:bg-zinc-800'
              }`}
            >
              {loading ? 'Creating Account...' : (
                <> GET STARTED <ArrowRight size={20} /> </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-zinc-500 font-medium">
            Member already? <Link to="/login" className="text-green-600 font-bold hover:underline"> Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
