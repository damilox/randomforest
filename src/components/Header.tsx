"use client";

import { Menu } from "lucide-react";

export default function Header() {
  // This function sends a system-wide signal to open the Sidebar
  const openMobileMenu = () => {
    document.dispatchEvent(new CustomEvent("openSidebar"));
  };

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 z-10 sticky top-0 shadow-sm">
      
      {/* Left Side: Hamburger Menu & Title */}
      <div className="flex items-center gap-3">
        {/* The Mobile Hamburger Button - NOW FUNCTIONAL */}
        <button 
          onClick={openMobileMenu}
          className="md:hidden text-slate-600 hover:text-slate-900 bg-slate-100 p-2 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        {/* Desktop Title */}
        <h2 className="text-slate-700 font-semibold tracking-tight hidden md:block">
          Administrative Dashboard
        </h2>
        
        {/* Mobile Title */}
        <h2 className="text-slate-700 font-semibold tracking-tight md:hidden">
          FUTMINNA AI
        </h2>
      </div>
      
      {/* Right Side: Clean System Status (Replaces the Search & Bell) */}
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="hidden sm:inline">System Operational</span>
      </div>

    </header>
  );
}