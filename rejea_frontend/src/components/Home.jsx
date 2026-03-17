import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ShieldCheck, Zap, ArrowRight, Bus } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-black italic tracking-tighter text-zinc-900">REJEA SWIFT</h1>
        <div className="flex gap-4">
          <button onClick={() => navigate('/')} className="text-sm font-bold text-zinc-600 hover:text-black transition">Login</button>
          <button 
            onClick={() => navigate('/register')} 
            className="bg-black text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-zinc-800 transition"
          >
            Join Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-8 py-20 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest">
            <Zap size={14} /> The Future of Matatu Travel
          </div>
          <h2 className="text-6xl lg:text-8xl font-black leading-[0.9] text-zinc-900">
            Book your seat, <br/> 
            <span className="text-green-600">skip the queue.</span>
          </h2>
          <p className="text-xl text-zinc-500 max-w-lg leading-relaxed">
            Nairobi's most reliable transport platform. Secure your seat in seconds and pay instantly with M-Pesa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/register')}
              className="px-10 py-5 bg-black text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-zinc-200"
            >
              START BOOKING <ArrowRight size={20} />
            </button>
            <div className="flex items-center gap-3 px-6 text-zinc-400">
              <ShieldCheck className="text-green-500" />
              <span className="text-sm font-medium">Safaricom Verified</span>
            </div>
          </div>
        </div>

        {/* Visual Element */}
        <div className="relative">
          <div className="bg-zinc-100 rounded-[3rem] aspect-square flex items-center justify-center overflow-hidden border-8 border-white shadow-2xl">
             <Bus size={200} className="text-zinc-200 rotate-12" />
             <div className="absolute bottom-10 left-10 bg-white p-6 rounded-3xl shadow-xl border border-zinc-100 animate-bounce">
                <p className="text-xs font-black text-zinc-400">NEXT TRIP</p>
                <p className="font-bold text-zinc-900">Nairobi → Nakuru</p>
                <p className="text-green-600 font-black text-xl">KES 800</p>
             </div>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="bg-zinc-50 py-24 px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-green-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
              <MapPin size={24} />
            </div>
            <h4 className="text-xl font-bold">Real-time Routes</h4>
            <p className="text-zinc-500">Track available buses and departure times across all major Nairobi terminals.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center shadow-lg shadow-zinc-200">
              <ShieldCheck size={24} />
            </div>
            <h4 className="text-xl font-bold">Atomic Seat Locking</h4>
            <p className="text-zinc-500">Our smart-lock system ensures no two people can book the same seat at once.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-zinc-200 text-zinc-900 rounded-xl flex items-center justify-center">
              <Zap size={24} />
            </div>
            <h4 className="text-xl font-bold">Instant M-Pesa</h4>
            <p className="text-zinc-500">Seamless Daraja API integration for lightning-fast STK Push payments.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;