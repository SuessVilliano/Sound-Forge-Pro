
import React, { useState } from 'react';
import { Mic, Search, FileText, Check, Clock, Play } from 'lucide-react';

const MOCK_LICENSES = [
    { id: 1, voice: "Sarah (Pro)", type: "Commercial", date: "2025-02-15", status: "Active", price: "$49.99" },
    { id: 2, voice: "Deep Narrator", type: "Personal", date: "2025-01-10", status: "Active", price: "$19.99" },
    { id: 3, voice: "Hype Man 3000", type: "Commercial", date: "2024-11-05", status: "Expired", price: "$99.00" }
];

export const VoiceMarketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'licenses'>('browse');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Mic className="w-8 h-8 text-cyan-500" /> Voice Avatar Marketplace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Rent professional AI voice avatars for your projects</p>
        </div>

        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1 border border-slate-300 dark:border-slate-700">
            <button 
                onClick={() => setActiveTab('browse')}
                className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                    activeTab === 'browse' 
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
                Browse Marketplace
            </button>
            <button 
                onClick={() => setActiveTab('licenses')}
                className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                    activeTab === 'licenses' 
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
                My Licenses
            </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
          <>
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input 
                    type="text" 
                    placeholder="Search voices by name, description, or tags..." 
                    className="w-full bg-white dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 rounded-xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-sm"
                />
            </div>

            <div className="h-96 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800/50 dark:to-slate-900 rounded-xl border border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                <Mic className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">Marketplace inventory loading...</p>
                <p className="text-sm mt-2">New voices are being added weekly.</p>
            </div>
          </>
      ) : (
          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm animate-in fade-in">
              <div className="overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider">
                              <th className="px-6 py-4">Voice Avatar</th>
                              <th className="px-6 py-4">License Type</th>
                              <th className="px-6 py-4">Purchase Date</th>
                              <th className="px-6 py-4">Status</th>
                              <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {MOCK_LICENSES.map((lic) => (
                              <tr key={lic.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                                              {lic.voice[0]}
                                          </div>
                                          <div>
                                              <div className="text-sm font-bold text-slate-900 dark:text-white">{lic.voice}</div>
                                              <div className="text-xs text-slate-500">{lic.price}</div>
                                          </div>
                                      </div>
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className="text-sm text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                          {lic.type}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                                      {lic.date}
                                  </td>
                                  <td className="px-6 py-4">
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                          lic.status === 'Active' 
                                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                      }`}>
                                          {lic.status === 'Active' && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
                                          {lic.status}
                                      </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      {lic.status === 'Active' ? (
                                          <button className="text-cyan-600 dark:text-cyan-400 hover:underline text-xs font-bold flex items-center justify-end gap-1">
                                              <FileText className="w-3 h-3" /> View Contract
                                          </button>
                                      ) : (
                                          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold flex items-center justify-end gap-1">
                                              <Clock className="w-3 h-3" /> Renew
                                          </button>
                                      )}
                                  </td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
              {MOCK_LICENSES.length === 0 && (
                  <div className="p-12 text-center text-slate-500">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                      <p>You haven't purchased any voice licenses yet.</p>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};
