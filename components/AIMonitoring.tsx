import React from 'react';
import { AlertCircle, Activity, Zap, CheckCircle } from 'lucide-react';

export const AIMonitoring: React.FC = () => {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-2xl font-bold text-purple-400">AI-Powered Monitoring</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time error analysis, automated troubleshooting, and intelligent insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-slate-900">
              <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold">Critical Errors</span>
                  <AlertCircle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-3xl font-bold mb-1">0</div>
              <div className="text-xs text-slate-500">Require immediate attention</div>
          </div>
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-slate-900">
              <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold">Open Errors</span>
                  <Activity className="w-4 h-4 text-orange-500" />
              </div>
              <div className="text-3xl font-bold mb-1">0</div>
              <div className="text-xs text-slate-500">Pending resolution</div>
          </div>
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-slate-900">
              <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold">AI Analyzed</span>
                  <Zap className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-3xl font-bold mb-1">0</div>
              <div className="text-xs text-slate-500">Errors analyzed by AI</div>
          </div>
           <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-slate-900">
              <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold">Auto-Fixable</span>
                  <Zap className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-3xl font-bold mb-1">0</div>
              <div className="text-xs text-slate-500">Can be auto-resolved</div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
          <button className="px-4 py-2 rounded-full bg-white text-slate-900 font-bold text-sm shadow-sm">Errors</button>
          <button className="px-4 py-2 rounded-full bg-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-300">AI Insights</button>
          <button className="px-4 py-2 rounded-full bg-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-300">Activity</button>
      </div>

      {/* Empty State */}
      <div className="bg-slate-50 rounded-xl p-12 flex flex-col items-center justify-center text-center border border-slate-200 min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No errors detected</h3>
          <p className="text-slate-500 text-sm mt-1">Your system is running smoothly!</p>
      </div>
    </div>
  );
};