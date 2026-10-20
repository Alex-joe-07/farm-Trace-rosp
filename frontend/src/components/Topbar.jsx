import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Search, Bell, ShieldCheck, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : 'Member');
  const role = user?.user_metadata?.role || localStorage.getItem('userRole') || 'Producer';
  const initial = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      if (logout) {
        await logout();
      }
      localStorage.removeItem('userRole');
      localStorage.removeItem('signupRole');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-3.5 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      {/* Left: Search input */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search batches, products, or IDs..."
            className="w-64 sm:w-80 pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-150"
          />
        </div>
      </div>

      {/* Right: Status badge & Dynamic user profile */}
      <div className="flex items-center gap-4">
        {/* Verification badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Verified Network</span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-800 leading-tight capitalize">
              {displayName}
            </p>
            <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
              {role}
            </p>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-xs shadow-sm ring-2 ring-emerald-500/20">
            {initial}
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}