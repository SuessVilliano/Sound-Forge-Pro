
import React, { useState, useEffect } from 'react';
import { Vote, FileText, CheckCircle2, XCircle, Clock, PieChart, Users, Coins, Loader2, Plus } from 'lucide-react';
import { Proposal, User } from '../types';
import { daoService } from '../services/daoService';
import { MOCK_STATS } from '../constants';

interface DAODashboardProps {
  user: User | null;
}

export const DAODashboard: React.FC<DAODashboardProps> = ({ user }) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'passed'>('all');

  // Calculate user's voting power
  const votingPower = daoService.calculateVotingPower(MOCK_STATS.xp, MOCK_STATS.totalEarnings);

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        const data = await daoService.getProposals();
        setProposals(data);
        setLoading(false);
    };
    loadData();
  }, []);

  const handleVote = async (proposalId: string, direction: 'for' | 'against') => {
      setVoting(proposalId);
      try {
          await daoService.castVote(proposalId, direction, votingPower);
          
          // Optimistic Update
          setProposals(prev => prev.map(p => {
              if (p.id === proposalId) {
                  return {
                      ...p,
                      votesFor: direction === 'for' ? p.votesFor + votingPower : p.votesFor,
                      votesAgainst: direction === 'against' ? p.votesAgainst + votingPower : p.votesAgainst,
                      userVoted: direction
                  };
              }
              return p;
          }));
      } catch (e) {
          console.error(e);
      } finally {
          setVoting(null);
      }
  };

  const filteredProposals = proposals.filter(p => {
      if (activeFilter === 'all') return true;
      return p.status === activeFilter;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-8 border border-indigo-900/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Vote className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  <Coins className="w-3 h-3" /> Governance Token: $SFG
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">SoundForge DAO</h1>
              <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
                  Shape the future of the platform. Vote on feature requests, royalty structures, and treasury allocation using your artist reputation score.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10 min-w-[200px]">
                      <span className="text-xs font-bold text-indigo-200 uppercase">Your Voting Power</span>
                      <div className="text-3xl font-bold text-white mt-1">{votingPower.toLocaleString()}</div>
                      <div className="text-[10px] text-indigo-300 mt-1">Based on XP & Earnings</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10 min-w-[200px]">
                      <span className="text-xs font-bold text-indigo-200 uppercase">Treasury Balance</span>
                      <div className="text-3xl font-bold text-white mt-1">$1,240,000</div>
                      <div className="text-[10px] text-indigo-300 mt-1">Community Managed</div>
                  </div>
              </div>
          </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center">
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
              {['all', 'active', 'passed'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setActiveFilter(filter as any)}
                    className={`px-4 py-2 rounded-md text-sm font-bold capitalize transition-all ${activeFilter === filter ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                      {filter}
                  </button>
              ))}
          </div>
          <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
              <Plus className="w-4 h-4" /> Create Proposal
          </button>
      </div>

      {/* Proposals List */}
      <div className="grid grid-cols-1 gap-6">
          {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
              </div>
          ) : (
              filteredProposals.map(proposal => {
                  const totalVotes = proposal.votesFor + proposal.votesAgainst;
                  const percentFor = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
                  const percentAgainst = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
                  const isVoting = voting === proposal.id;

                  return (
                      <div key={proposal.id} className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:border-indigo-500/30 transition-all">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <div className="flex items-center gap-3 mb-2">
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                          proposal.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' :
                                          proposal.status === 'passed' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' :
                                          'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
                                      }`}>
                                          {proposal.status}
                                      </span>
                                      <span className="text-xs text-slate-500 font-bold">{proposal.category}</span>
                                      <span className="text-xs text-slate-400 flex items-center gap-1">
                                          <Clock className="w-3 h-3" /> Ends {new Date(proposal.deadline).toLocaleDateString()}
                                      </span>
                                  </div>
                                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{proposal.title}</h3>
                                  <p className="text-slate-600 dark:text-slate-400 text-sm max-w-3xl leading-relaxed">{proposal.description}</p>
                              </div>
                              {proposal.userVoted && (
                                  <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-lg text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                      <CheckCircle2 className="w-4 h-4 text-green-500" /> Voted {proposal.userVoted.toUpperCase()}
                                  </div>
                              )}
                          </div>

                          {/* Voting Progress */}
                          <div className="mb-6 bg-slate-100 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                              <div className="flex justify-between text-xs font-bold mb-2">
                                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3" /> Yes ({percentFor.toFixed(1)}%)
                                  </span>
                                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                                      <XCircle className="w-3 h-3" /> No ({percentAgainst.toFixed(1)}%)
                                  </span>
                              </div>
                              <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                  <div className="h-full bg-green-500" style={{ width: `${percentFor}%` }}></div>
                                  <div className="h-full bg-red-500" style={{ width: `${percentAgainst}%` }}></div>
                              </div>
                              <div className="text-center mt-2 text-[10px] text-slate-400">
                                  {totalVotes.toLocaleString()} Total Votes
                              </div>
                          </div>

                          {/* Action Buttons */}
                          {proposal.status === 'active' && !proposal.userVoted && (
                              <div className="flex gap-4">
                                  <button 
                                    onClick={() => handleVote(proposal.id, 'for')}
                                    disabled={!!voting}
                                    className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                  >
                                      {isVoting ? <Loader2 className="w-4 h-4 animate-spin"/> : <CheckCircle2 className="w-4 h-4"/>}
                                      Vote For
                                  </button>
                                  <button 
                                    onClick={() => handleVote(proposal.id, 'against')}
                                    disabled={!!voting}
                                    className="flex-1 py-3 bg-slate-200 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-900/20 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                  >
                                      <XCircle className="w-4 h-4"/> Vote Against
                                  </button>
                              </div>
                          )}
                      </div>
                  );
              })
          )}
      </div>
    </div>
  );
};
