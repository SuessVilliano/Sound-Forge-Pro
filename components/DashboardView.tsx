
import React from 'react';
import { DollarSign, Play, Activity, TrendingUp, Upload, CheckCircle, User, ArrowRight } from 'lucide-react';
import { User as UserType, Stats, Opportunity } from '../types';
import { VIEWS } from '../constants';

interface DashboardViewProps {
  user: UserType;
  stats: Stats;
  opportunities: Opportunity[];
  onNavigate: (view: string) => void;
  onUpgrade: () => void;
  onUpload: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
    user, stats, opportunities, onNavigate, onUpgrade, onUpload 
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Welcome back, {user.displayName}.</p>
        </div>
        {user.plan === 'free' && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 flex items-center gap-3">
                <div className="text-xs text-indigo-200">
                    <span className="font-bold text-white">Free Plan</span> • 80% Royalties
                </div>
                <button onClick={onUpgrade} className="text-xs bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 rounded font-bold transition-colors">
                    Upgrade
                </button>
            </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings', value: `$${stats.totalEarnings.toLocaleString()}`, change: '+12.5%', icon: DollarSign, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-400/10' },
          { label: 'Total Streams', value: stats.totalStreams.toLocaleString(), change: '+8.2%', icon: Play, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-400/10' },
          { label: 'Active Opportunities', value: stats.activeOpportunities, change: 'New!', icon: Activity, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-400/10' },
          { label: 'Brand Score', value: stats.brandScore, change: 'Top 5%', icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-400/10' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`text-xs font-bold ${stat.change.includes('+') ? 'text-green-600 dark:text-green-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Activity & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity Chart */}
          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                 <button className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500">View All</button>
             </div>
            <div className="h-64 w-full flex items-center justify-center flex-col text-slate-400 dark:text-slate-500">
                 <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                     <Activity className="w-6 h-6 opacity-50" />
                 </div>
                 <p>No recent activity</p>
                 <p className="text-xs mt-1">Start by uploading a track or exploring opportunities</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-4">
             <button 
                onClick={onUpload}
                className="bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4 transition-all group text-left shadow-sm"
             >
                <div className="bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 p-3 rounded-lg transition-colors shrink-0">
                  <Upload className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                </div>
                <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">Upload New Track</span>
                    <span className="text-xs text-slate-500">Add music to your catalog</span>
                </div>
             </button>
             <button 
                onClick={() => onNavigate(VIEWS.OPPORTUNITIES)}
                className="bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4 transition-all group text-left shadow-sm"
             >
                 <div className="bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 p-3 rounded-lg transition-colors shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                </div>
                <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">Submit to Opportunity</span>
                    <span className="text-xs text-slate-500">Apply for placements</span>
                </div>
             </button>
             <button 
                onClick={() => onNavigate(VIEWS.BRAND)}
                className="bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4 transition-all group text-left shadow-sm"
             >
                <div className="bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 p-3 rounded-lg transition-colors shrink-0">
                  <User className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">Generate Press Kit</span>
                    <span className="text-xs text-slate-500">AI-powered bio & content</span>
                </div>
             </button>
          </div>
        </div>

        {/* Right Col: Featured Opps */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Featured Opportunities</h3>
             <div className="flex items-center gap-2">
                 <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full">All Genres</span>
                 <button 
                    onClick={() => onNavigate(VIEWS.OPPORTUNITIES)}
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500"
                >
                    View All
                </button>
             </div>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1 max-h-[600px] pr-2">
            {opportunities.slice(0, 3).map(op => (
              <div key={op.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-slate-500 font-mono">{op.usage_type.toUpperCase()}</span>
                  <span className="text-green-600 dark:text-green-400 text-xs font-bold">{op.match_score}% Match</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{op.brief_title}</h4>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{op.description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">${op.payout_min} - ${op.payout_max}</span>
                    <button className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white dark:hover:text-slate-950 transition-all">
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
