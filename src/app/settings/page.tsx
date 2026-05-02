"use client";

import { Sliders, Database, Key, Save, AlertTriangle } from "lucide-react";

export default function ModelSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      
      {/* Header */}
      <header className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">System Configuration</h1>
        <p className="text-sm text-slate-500 mt-1">Manage AI model weights, thresholds, and API integrations.</p>
      </header>

      {/* Settings Grid */}
      <div className="grid gap-6">
        
        {/* Machine Learning Model Tuning */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Sliders className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-800">Algorithm Tuning</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="flex justify-between text-sm font-semibold text-slate-700 mb-2">
                <span>Pass/Fail Confidence Threshold</span>
                <span className="text-blue-600">75%</span>
              </label>
              <input type="range" min="50" max="95" defaultValue="75" className="w-full accent-blue-600" />
              <p className="text-xs text-slate-500 mt-2">The AI must be at least 75% confident to predict a "Pass" without flagging for review.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Primary Weight Variable</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option>Continuous Assessment (CA)</option>
                <option>Attendance Rate</option>
                <option>Weekly Study Hours</option>
              </select>
            </div>
          </div>
        </div>

        {/* Gemini API Configuration */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <Key className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-bold text-slate-800">Gemini Prescriptive Engine</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Google AI Model</label>
              <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-purple-500 text-sm">
                <option>gemini-2.5-flash (Fast, Recommended)</option>
                <option>gemini-1.5-pro (High reasoning)</option>
              </select>
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3 mt-4">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-yellow-800">API Key Security</h4>
                <p className="text-xs text-yellow-700 mt-1">Your API key is currently stored securely in the local environment variables (.env.local). Do not expose it in the frontend code.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Database Connection */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm opacity-60">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <Database className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-bold text-slate-800">Database Connection (Coming Soon)</h2>
          </div>
          <p className="text-sm text-slate-500">PostgreSQL connection strings will be configured here during Chapter 4 Implementation.</p>
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