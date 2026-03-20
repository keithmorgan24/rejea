import React from 'react';
import { User, ShieldCheck, Truck, Phone, Hash, Calendar, Award, LogOut } from 'lucide-react';

// Destructure onLogout from props
const DriverProfile = ({ user, onLogout }) => {
  const stats = [
    { label: 'Total Trips', value: '124', icon: <Truck size={20}/> },
    { label: 'Rating', value: '4.9', icon: <Award size={20}/> },
    { label: 'Joined', value: 'Mar 2026', icon: <Calendar size={20}/> },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Driver Identity Card */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6">
          <div className="bg-green-500/10 text-green-500 px-4 py-1 rounded-full text-xs font-bold border border-green-500/20 flex items-center gap-2">
            <ShieldCheck size={14} /> VERIFIED OPERATOR
          </div>
        </div>

        <div className="flex items-center gap-6 mb-8">
          <div className="w-20 h-20 bg-zinc-800 rounded-2xl flex items-center justify-center border border-zinc-700">
            <User size={40} className="text-zinc-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white uppercase italic tracking-tighter">
              {user?.username}
            </h2>
            <p className="text-zinc-500 font-mono text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-zinc-950/50 p-4 rounded-2xl border border-zinc-800">
              <div className="text-zinc-500 mb-2">{stat.icon}</div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Official Credentials & Logout Section */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6 px-2">Compliance Details</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-zinc-950/30 rounded-2xl border border-zinc-800/50">
            <div className="flex items-center gap-3 text-zinc-400">
              <Hash size={18} />
              <span className="text-sm">National ID</span>
            </div>
            <span className="font-mono text-white">{user?.id_number || "Verified"}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-950/30 rounded-2xl border border-zinc-800/50">
            <div className="flex items-center gap-3 text-zinc-400">
              <ShieldCheck size={18} />
              <span className="text-sm">DL Number</span>
            </div>
            <span className="font-mono text-white">{user?.license_number || "Verified"}</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-950/30 rounded-2xl border border-zinc-800/50">
            <div className="flex items-center gap-3 text-zinc-400">
              <Phone size={18} />
              <span className="text-sm">Contact Number</span>
            </div>
            <span className="font-mono text-white">{user?.phone_number}</span>
          </div>
        </div>

        {/* LOGOUT ACTION */}
        <div className="mt-8 pt-6 border-t border-zinc-800/50">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-3 py-5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black transition-all active:scale-95 border border-red-500/20 shadow-lg shadow-red-500/5"
          >
            <LogOut size={20} />
            SIGN OUT OF REJEA
          </button>
        </div>
      </section>
    </div>
  );
};

export default DriverProfile;
