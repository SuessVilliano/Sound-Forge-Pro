
import React, { useState, useEffect } from 'react';
import { Users, Send, TrendingUp, UserPlus, Search, Plus, Sparkles, FileText, Music2, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { CAMPAIGN_TEMPLATES } from '../constants';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';

export const MarketingCRM: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Contacts');
  const [contacts, setContacts] = useState<any[]>([]);
  const user = authService.getCurrentUser();

  useEffect(() => {
    let unsubscribe: () => void;
    if (user && activeTab === 'Contacts') {
        unsubscribe = dataService.subscribeToContacts(user.uid, (data) => {
            setContacts(data);
        });
    }
    return () => { if(unsubscribe) unsubscribe(); }
  }, [user, activeTab]);

  const handleImport = async () => {
      // Simulation of import
      if (user) {
          await dataService.addContact(user.uid, {
              name: "Fan #" + Math.floor(Math.random()*1000),
              email: "fan@example.com",
              source: "Manual Import"
          });
      }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-start">
         <div>
            <h1 className="text-2xl font-bold text-white">Marketing CRM</h1>
            <p className="text-slate-400 text-sm mt-1">Manage your fan relationships and marketing campaigns</p>
         </div>
         <div className="flex items-center gap-3">
             <button onClick={handleImport} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors">
                 <Plus className="w-4 h-4" /> Quick Add
             </button>
         </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
            { label: "Total Contacts", val: contacts.length.toString(), change: "+12.5%", icon: Users, color: "text-cyan-400" },
            { label: "Active Campaigns", val: "0", change: "2 this week", icon: Send, color: "text-green-400" },
            { label: "Open Rate", val: "24.5%", change: "+5.2%", icon: TrendingUp, color: "text-yellow-400" },
            { label: "New Followers", val: "0", change: "+18.3%", icon: UserPlus, color: "text-purple-400" }
        ].map((stat, i) => (
            <div key={i} className="bg-slate-850 p-5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-start mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className={`text-xs font-bold text-green-400`}>{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-white">{stat.val}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-800">
         {['Contacts', 'Campaigns', 'Automations', 'Analytics'].map((tab) => (
             <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-t-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab 
                    ? 'bg-slate-800 text-cyan-400 border-b-2 border-cyan-400' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
             >
                 {tab}
             </button>
         ))}
      </div>

      {/* Main Content */}
      <div className="animate-in fade-in duration-300">
        
        {/* CONTACTS VIEW */}
        {activeTab === 'Contacts' && (
            <div className="bg-slate-850 rounded-xl border border-slate-800 p-6 min-h-[400px]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Fan Contacts</h3>
                    <div className="flex gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input type="text" placeholder="Search contacts..." className="bg-slate-900 border border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500" />
                        </div>
                    </div>
                </div>

                {contacts.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs text-slate-500 border-b border-slate-700">
                                    <th className="pb-3 pl-2">Name</th>
                                    <th className="pb-3">Email</th>
                                    <th className="pb-3">Source</th>
                                    <th className="pb-3 text-right pr-2">Added</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {contacts.map(c => (
                                    <tr key={c.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                        <td className="py-3 pl-2 text-white font-medium">{c.name}</td>
                                        <td className="py-3 text-slate-400">{c.email}</td>
                                        <td className="py-3 text-cyan-400 text-xs">{c.source}</td>
                                        <td className="py-3 text-right pr-2 text-slate-500 text-xs">Just now</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <Users className="w-16 h-16 mb-4 opacity-20" />
                        <h4 className="text-xl font-bold text-slate-400">No contacts yet</h4>
                        <p className="text-sm mt-2 mb-6">Start building your fan database to create targeted marketing campaigns</p>
                        <button onClick={handleImport} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-colors">
                            <Plus className="w-4 h-4" /> Import Contacts
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* CAMPAIGNS VIEW */}
        {activeTab === 'Campaigns' && (
            <div className="space-y-8">
                {/* Templates Section */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4">Start a Campaign</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {CAMPAIGN_TEMPLATES.map((template) => (
                            <div key={template.id} className="bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 transition-all cursor-pointer group">
                                <div className={`w-12 h-12 rounded-xl ${template.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <template.icon className={`w-6 h-6 ${template.color}`} />
                                </div>
                                <h4 className="text-white font-bold text-lg mb-2">{template.title}</h4>
                                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{template.description}</p>
                                
                                <div className="space-y-2 mb-6">
                                    {template.steps.slice(0, 3).map((step, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                                            {step}
                                        </div>
                                    ))}
                                </div>

                                <button className="w-full py-2 rounded-lg bg-slate-800 text-white text-sm font-bold group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                                    Use Template
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Campaigns Section */}
                <div>
                     <h3 className="text-lg font-bold text-white mb-4">Recent Campaigns</h3>
                     <div className="bg-slate-850 rounded-xl border border-slate-800 overflow-hidden">
                         <div className="p-8 flex flex-col items-center justify-center text-slate-500">
                             <Send className="w-12 h-12 mb-4 opacity-20" />
                             <p className="font-medium">No active campaigns</p>
                             <p className="text-sm mt-1">Launch a campaign above to start tracking results.</p>
                         </div>
                     </div>
                </div>
            </div>
        )}

        {/* PLACEHOLDER VIEWS */}
        {(activeTab === 'Automations' || activeTab === 'Analytics') && (
            <div className="bg-slate-850 rounded-xl border border-slate-800 p-12 flex flex-col items-center justify-center text-slate-500 min-h-[400px]">
                <Sparkles className="w-16 h-16 mb-4 opacity-20" />
                <h4 className="text-xl font-bold text-slate-400">{activeTab} coming soon</h4>
                <p className="text-sm mt-2">This module is currently under development.</p>
            </div>
        )}

      </div>
      
      {/* Quick Actions Footer */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800">
          <button className="bg-slate-850 border border-slate-800 p-4 rounded-xl flex flex-col items-center gap-2 hover:border-slate-600 transition-colors group">
              <Send className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-white">SMS Blast</span>
              <span className="text-xs text-slate-500">Quick message</span>
          </button>
          <button className="bg-slate-850 border border-slate-800 p-4 rounded-xl flex flex-col items-center gap-2 hover:border-slate-600 transition-colors group">
              <UserPlus className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-white">Import Fans</span>
              <span className="text-xs text-slate-500">CSV Upload</span>
          </button>
          <button className="bg-slate-850 border border-slate-800 p-4 rounded-xl flex flex-col items-center gap-2 hover:border-slate-600 transition-colors group">
              <TrendingUp className="w-6 h-6 text-yellow-400 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold text-white">View Reports</span>
              <span className="text-xs text-slate-500">Detailed analytics</span>
          </button>
      </div>
    </div>
  );
};

function DollarSign(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
}
