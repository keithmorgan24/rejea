import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, User, History, MapPin, Settings } from 'lucide-react';

const Navbar = ({ userType }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 px-6 py-3 pb-8 z-50">
      <div className="max-w-md mx-auto flex justify-between items-center">
        
        {/* Home / Dashboard Link */}
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-green-500' : 'text-zinc-500'}`
          }
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tight">Home</span>
        </NavLink>

        {/* Role-Specific Secondary Link */}
        {userType === 'driver' ? (
          <NavLink 
            to="/driver-stats" 
            className={({ isActive }) => 
              `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-green-500' : 'text-zinc-500'}`
            }
          >
            <Settings size={24} />
            <span className="text-[10px] font-bold uppercase tracking-tight">Fleet</span>
          </NavLink>
        ) : (
          <NavLink 
            to="/history" 
            className={({ isActive }) => 
              `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-green-500' : 'text-zinc-500'}`
            }
          >
            <History size={24} />
            <span className="text-[10px] font-bold uppercase tracking-tight">Trips</span>
          </NavLink>
        )}

        {/* Profile Link (Universal) */}
        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            `flex flex-col items-center gap-1 transition-colors ${isActive ? 'text-green-500' : 'text-zinc-500'}`
          }
        >
          <User size={24} />
          <span className="text-[10px] font-bold uppercase tracking-tight">Profile</span>
        </NavLink>

      </div>
    </nav>
  );
};

export default Navbar;