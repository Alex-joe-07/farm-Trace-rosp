import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Shield, ArrowUpRight } from "lucide-react";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
      {/* Sleek Minimal Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <Link to="/dashboard" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <span className="text-base font-black text-emerald-400">f</span>
            <span className="text-xs font-bold text-slate-200">T</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900">
                farm<span className="text-emerald-600 font-extrabold">Trace</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Enterprise
              </span>
            </div>
          </div>
        </Link>

        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <span>Public Portal</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-slate-50">{children}</main>

      {/* Modern Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span className="font-medium text-slate-700">farmTrace Core</span>
            <span>·</span>
            <span>Immutable Agricultural Supply Chain</span>
          </div>
          <p>© {new Date().getFullYear()} farmTrace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}