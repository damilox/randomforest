"use client";

import { Sliders, Key, Save, AlertTriangle } from "lucide-react";

export default function ModelSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      
      {/* Header */}
      <header className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">System Configuration</h1>
        <p className="text-sm text-slate-500 mt-1">Manage Random Forest weights, thresholds, and Gemini API integration.</p>
      </header>

      {/* Settings Grid */}
      <div className="grid gap-6">
        
        {/* Machine Learning Model Tuning */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Random Forest Algorithm Tuning</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                <span>Model Base Accuracy</span>
                <span className="text-blue-600">92%</span>
              </label>
              <input 
                type="range" 
                min="50" 
                max="99" 
                defaultValue="92" 
                disabled 
                className="w-full accent-blue-600 opacity-70 cursor-not-allowed" 
              />
              <p className="text-xs text-slate-500 mt-2">Locked to 92% based on cross-validation testing of the Random Forest model.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Feature Weight (Feature Importance)</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium">
                <option>Previous GPA (Weight: 0.32)</option>
                <option>Attendance Rate (Weight: 0.27)</option>
                <option>Study Hours (Weight: 0.18)</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">Configured to match Section 4.6 Feature Importance findings.</p>
            </div>
          </div>
        </div>

        {/* Gemini API Configuration */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Key className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-slate-800">Prescriptive Engine API</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Active AI Model</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-purple-500 text-sm font-medium">
                <option>gemini-2.0-flash (Fast, Recommended)</option>
              </select>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3 mt-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-yellow-800">Secure Environment Mode</h4>
                <p className="text-xs text-yellow-700 mt-1">API Key is secured in backend environment variables. Do not expose locally.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
            <Save className="w-5 h-5" />
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
}