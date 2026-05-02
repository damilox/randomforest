"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  BrainCircuit, 
  Plus, 
  Settings, 
  Share2, 
  HelpCircle,
  Check,
  X
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Listens for the mobile menu button click from the Header
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    document.addEventListener("openSidebar", handleOpen);
    return () => document.removeEventListener("openSidebar", handleOpen);
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); 
  };

  const handleNewPrediction = () => {
    setIsOpen(false); 
    window.location.href = '/'; 
  };

  return (
    <>
      {/* Mobile Dark Overlay (Click to close) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        
        {/* Brand, Logo & Mobile Close Button */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-800 md:border-none">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-blue-500 w-8 h-8" />
            <span className="text-white font-bold text-xl tracking-tight">FUTMINNA AI</span>
          </div>
          {/* Mobile-only Close Button */}
          <button 
            onClick={() => setIsOpen(false)} 
            className="md:hidden text-slate-400 hover:text-white p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Primary Action: New Session */}
        <div className="px-4 pb-4 border-b border-slate-800">
          <button 
            onClick={handleNewPrediction}
            className="w-full flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-3 rounded-full transition-all border border-slate-700 shadow-sm"
          >
            <Plus className="w-5 h-5 text-blue-400" />
            <span className="font-medium text-sm">New Prediction</span>
          </button>
        </div>

        {/* This invisible block pushes the buttons below it to the bottom */}
        <div className="flex-1"></div>

        {/* Bottom Utility Actions */}
        <div className="p-4 space-y-1 border-t border-slate-800">
          <button 
            onClick={handleShare}
            className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-sm font-medium"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Share2 className="w-5 h-5" />}
            <span className={copied ? "text-emerald-500" : ""}>
              {copied ? "Link Copied!" : "Share Results"}
            </span>
          </button>

          <Link 
            href="/settings"
            onClick={() => setIsOpen(false)}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-colors text-sm font-medium ${
              pathname === "/settings" 
                ? "bg-blue-600/10 text-blue-400" 
                : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings className="w-5 h-5" />
            Model Settings
          </Link>

          <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-sm font-medium">
            <HelpCircle className="w-5 h-5" />
            Help & FAQ
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 m-4 mt-0 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-200">Admin Panel</span>
            <span className="text-xs text-blue-400">Gemini 2.5 Active</span>
          </div>
        </div>
      </aside>
    </>
  );
}