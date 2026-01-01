
import React, { useState } from 'react';
import { AlertCircle, Activity, Zap, CheckCircle, BarChart, Server } from 'lucide-react';

export const AIMonitoring: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'errors' | 'insights' | 'activity'>('errors');

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold text-purple-400">AI-Powered Monitoring</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time error analysis, automated troubleshooting, and intelligent insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-500">Critical Errors</span>
                  <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-3xl font-bold mb-1">0</div>
              <div className="text-xs text-slate-500">Require immediate attention</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-500">Open Errors</span>
                  <Activity className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-3xl font-bold mb-1">0</div>
              <div className="text-xs text-slate-500">Pending resolution</div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-500">AI Analyzed</span>
                  <Zap className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-bold mb-1">24</div>
              <div className="text-xs text-slate-500">Errors analyzed by AI</div>
          </div>
           <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
              <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-slate-500">Auto-Fixable</span>
                  <Zap className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-3xl font-bold mb-1">12</div>
              <div className="text-xs text-slate-500">Can be auto-resolved</div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
          <button 
            onClick={() => setActiveTab('errors')}
            className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${
                activeTab === 'errors' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Errors
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${
                activeTab === 'insights' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            AI Insights
          </button>
          <button 
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-md font-bold text-sm transition-all ${
                activeTab === 'activity' 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Activity
          </button>
      </div>

      {/* Tab Content */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 min-h-[300px]">
          {activeTab === 'errors' && (
              <div className="p-12 flex flex-col items-center justify-center text-center animate-in fade-in">
                  <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                      <CheckCircle className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">No active errors detected</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Your system is running smoothly!</p>
              </div>
          )}

          {activeTab === 'insights' && (
              <div className="p-6 space-y-4 animate-in fade-in">
                  <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5 text-purple-500" />
                      </div>
                      <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Latency Optimization Recommended</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              AI detected a 150ms delay in vocal processing pipeline. Suggest enabling edge-caching for model assets.
                          </p>
                          <button className="mt-2 text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded font-bold transition-colors">
                              Auto-Fix
                          </button>
                      </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center shrink-0">
                          <BarChart className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Usage Spike Predicted</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                              Based on release patterns, expect 3x API load this weekend. System will auto-scale.
                          </p>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'activity' && (
              <div className="p-6 space-y-4 animate-in fade-in">
                  {[
                      { event: "Auto-scaled Database", time: "10 mins ago", status: "Success" },
                      { event: "Resolved API Timeout", time: "1 hour ago", status: "Auto-Fixed" },
                      { event: "System Health Check", time: "2 hours ago", status: "Passed" },
                      { event: "Backup Completed", time: "4 hours ago", status: "Success" },
                  ].map((log, i) => (
                      <div key={i} className="flex justify-between items-center p-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                          <div className="flex items-center gap-3">
                              <Server className="w-4 h-4 text-slate-400" />
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{log.event}</span>
                          </div>
                          <div className="flex items-center gap-4">
                              <span className="text-xs text-slate-500">{log.time}</span>
                              <span className="text-xs font-bold text-green-500">{log.status}</span>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
    </div>
  );
};
