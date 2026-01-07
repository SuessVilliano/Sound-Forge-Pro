
import React, { useState, useRef, useEffect } from 'react';
import { Swords, Play, Pause, Vote, MessageSquare, Share2, Flame, Users, Clock, Bot, User, Mic2, AlertCircle, Headphones, Bell, Send, Info, BarChart2, Shield, Music, ThumbsUp, Calendar, CheckCircle2, Plus, Gavel, Award, DollarSign, X } from 'lucide-react';
import { MOCK_BATTLES } from '../constants';
import { Battle, BattleParticipant, BattleRulesConfig } from '../types';
import { generateBattleCommentary } from '../services/geminiService';

export const BattlesArena: React.FC = () => {
  const [view, setView] = useState<'lobby' | 'arena'>('lobby');
  const [activeBattle, setActiveBattle] = useState<Battle | null>(null);
  const [filter, setFilter] = useState('All');
  const [battles, setBattles] = useState<Battle[]>(MOCK_BATTLES);
  
  // Create Battle Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newConfig, setNewConfig] = useState<BattleRulesConfig>({
      maxDurationSeconds: 180,
      format: 'Hybrid',
      votingWindow: 'Live',
      maxEntries: 2,
      rewards: { xp: 500, cash: 0, badge: '' },
      customRules: []
  });
  const [newBattleTitle, setNewBattleTitle] = useState('');
  const [newBattleGenre, setNewBattleGenre] = useState('Pop');

  // --- ARENA STATE ---
  const [isPlaying, setIsPlaying] = useState<string | null>(null); 
  const [timeLeft, setTimeLeft] = useState(300); 
  const [userVote, setUserVote] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [activeTab, setActiveTab] = useState<'chat' | 'info' | 'stats'>('chat');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{id: string, user: string, text: string, isSystem?: boolean}[]>([
      { id: '1', user: 'System', text: 'Welcome to the arena! The crowd is hype.', isSystem: true },
  ]);

  const [tickerComment, setTickerComment] = useState("Battle in progress...");

  useEffect(() => {
      if (!audioRef.current) {
          audioRef.current = new Audio();
      }
      return () => {
          if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
          }
      };
  }, []);

  useEffect(() => {
      if (view === 'arena' && timeLeft > 0) {
          const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
          return () => clearInterval(timer);
      }
  }, [view, timeLeft]);

  useEffect(() => {
      if (view === 'arena' && activeBattle) {
          const interval = setInterval(async () => {
              if (activeBattle.participants.length < 2) return;
              const p1 = activeBattle.participants[0]?.artistName || 'Artist 1';
              const p2 = activeBattle.participants[1]?.artistName || 'Artist 2';
              const comment = await generateBattleCommentary(activeBattle.genre, p1, p2, isPlaying ? "Sonic impact rising" : "Tension building");
              setTickerComment(comment);
          }, 15000); 
          return () => clearInterval(interval);
      }
  }, [view, activeBattle, isPlaying]);

  const enterBattle = (battle: Battle) => {
      setActiveBattle(battle);
      setView('arena');
      setTimeLeft(battle.status === 'Ended' ? 0 : 300);
      setIsPlaying(null);
      setUserVote(null);
  };

  const handlePlay = (participant: BattleParticipant) => {
      if (!audioRef.current || !participant.audioUrl) return;
      if (isPlaying === participant.id) {
          audioRef.current.pause();
          setIsPlaying(null);
      } else {
          audioRef.current.src = participant.audioUrl;
          audioRef.current.play();
          setIsPlaying(participant.id);
      }
  };

  const handleVote = (participantId: string) => {
      if (userVote) return;
      setUserVote(participantId);
      setChatMessages(prev => [...prev, { id: `sys_${Date.now()}`, user: 'You', text: 'Cast a vote!', isSystem: true }]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;
      setChatMessages(prev => [...prev, { id: `msg_${Date.now()}`, user: 'You', text: chatInput }]);
      setChatInput('');
  };

  const getTimeRemaining = (endTime: string) => {
      const diff = new Date(endTime).getTime() - new Date().getTime();
      if (diff <= 0) return "Ended";
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const getCardStyles = (status: string) => {
      switch(status) {
          case 'Live': return 'border-red-500/50 shadow-red-500/5 hover:border-red-500';
          case 'Voting': return 'border-purple-500/50 shadow-purple-500/5 hover:border-purple-500';
          default: return 'border-slate-800 hover:border-cyan-500/50';
      }
  };

  if (view === 'lobby') {
      const filteredBattles = battles.filter(b => 
          filter === 'All' || 
          b.status === filter || 
          b.type === filter ||
          b.genre === filter
      );

      return (
          <div className="space-y-8 animate-in fade-in pb-20">
              <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-64 flex flex-col justify-center p-12 shadow-2xl">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none"></div>
                  <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 animate-pulse">
                          <Swords className="w-3 h-3" /> Live Arena Active
                      </div>
                      <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">The Merge Arena</h1>
                      <p className="text-slate-500 text-sm max-w-md">The proving ground for AI and human creators. Secure your reputation and earn $MERGE rewards.</p>
                  </div>
                  <button onClick={() => setShowCreateModal(true)} className="absolute top-12 right-12 bg-slate-950 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-black/20">
                      <Plus className="w-4 h-4" /> Start Battle
                  </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center">
                  <button onClick={() => setFilter('All')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'All' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>All Arena</button>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-2"></div>
                  {['Live', 'Voting', 'Upcoming', 'AI Only', 'Hybrid', 'Beat'].map(f => (
                      <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-cyan-500 text-slate-950' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>{f}</button>
                  ))}
              </div>

              {/* Battle Grid */}
              {filteredBattles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {filteredBattles.map(battle => (
                          <div key={battle.id} onClick={() => enterBattle(battle)} className={`bg-white dark:bg-slate-900 border rounded-[2rem] overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] ${getCardStyles(battle.status)}`}>
                              <div className="h-44 relative bg-slate-800">
                                  <div className="absolute inset-0 flex">
                                      <img src={battle.participants[0]?.image} className="w-1/2 h-full object-cover opacity-60" />
                                      <img src={battle.participants[1]?.image} className="w-1/2 h-full object-cover opacity-60" />
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="bg-slate-950/80 border border-white/20 w-10 h-10 rounded-full flex items-center justify-center font-black italic text-xs">VS</div>
                                  </div>
                                  <div className="absolute top-4 left-4 flex gap-2">
                                      {battle.status === 'Live' && <span className="bg-red-600 text-white text-[8px] px-2 py-0.5 rounded font-black uppercase animate-pulse">Live</span>}
                                      <span className="bg-slate-950/60 text-white text-[8px] px-2 py-0.5 rounded font-black uppercase">{battle.type}</span>
                                  </div>
                              </div>
                              <div className="p-6">
                                  <div className="flex justify-between items-start mb-2">
                                      <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">{battle.title}</h3>
                                      <span className="text-[10px] font-black text-cyan-500 uppercase">{battle.genre}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 line-clamp-2 mb-6">{battle.description}</p>
                                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                          <Clock className="w-3 h-3" /> {getTimeRemaining(battle.endTime)}
                                      </div>
                                      <div className="flex items-center gap-3">
                                          <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
                                              <Headphones className="w-3 h-3" /> {battle.listeners}
                                          </span>
                                          <span className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase">
                                              <Vote className="w-3 h-3" /> {battle.totalVotes}
                                          </span>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-slate-500">
                      <Music className="w-12 h-12 mb-4 opacity-20" />
                      <p className="font-bold">No battles found matching this filter.</p>
                      <button onClick={() => setFilter('All')} className="text-cyan-500 text-xs font-black uppercase mt-2 hover:underline">Clear Filters</button>
                  </div>
              )}

              {/* Create Modal */}
              {showCreateModal && (
                  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
                      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative">
                          <button onClick={() => setShowCreateModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X className="w-6 h-6"/></button>
                          <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-6">Initialize Battle</h2>
                          <div className="space-y-4">
                              <input placeholder="Battle Title" value={newBattleTitle} onChange={e => setNewBattleTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:border-indigo-500" />
                              <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none">
                                  <option>Pop</option><option>Hip Hop</option><option>Trap</option><option>Lo-Fi</option>
                              </select>
                              <button onClick={() => { setBattles([ { id: `b_${Date.now()}`, title: newBattleTitle || 'New Battle', description: 'User created battle.', type: 'Hybrid', genre: 'Pop', status: 'Live', endTime: new Date(Date.now() + 3600000).toISOString(), totalVotes: 0, listeners: 1, config: { rewards: { cash: 100, xp: 500 }, customRules: [] }, participants: [] }, ...battles]); setShowCreateModal(false); }} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-lg shadow-indigo-500/20 uppercase tracking-widest text-xs">Authorize Arena Deployment</button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  if (!activeBattle) return null;

  return (
      <div className="min-h-screen bg-black text-white flex flex-col fixed inset-0 z-[100] animate-in slide-in-from-bottom-4">
          <div className="h-16 bg-slate-900 border-b border-white/5 flex items-center justify-between px-8">
              <div className="flex items-center gap-6">
                  <button onClick={() => setView('lobby')} className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">← Exit Arena</button>
                  <h2 className="font-black uppercase tracking-tight text-xl">{activeBattle.title}</h2>
              </div>
              <div className="flex items-center gap-6">
                  <div className="text-red-500 font-black text-sm uppercase flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> {tickerComment}
                  </div>
              </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="flex-1 relative flex flex-col items-center justify-center p-12 overflow-hidden bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black">
                  <div className="grid grid-cols-2 gap-24 relative z-10 w-full max-w-5xl">
                      {activeBattle.participants.map((p, i) => (
                          <div key={p.id} className="flex flex-col items-center gap-8">
                              <div className={`relative group w-64 h-64 rounded-full p-1 border-4 transition-all duration-700 ${isPlaying === p.id ? 'border-cyan-400 scale-105 shadow-[0_0_50px_rgba(6,182,212,0.3)]' : 'border-slate-800 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}>
                                  <img src={p.image} className="w-full h-full rounded-full object-cover" />
                                  <button onClick={() => handlePlay(p)} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-all">
                                      {isPlaying === p.id ? <Pause className="w-12 h-12 fill-white" /> : <Play className="w-12 h-12 fill-white ml-2" />}
                                  </button>
                              </div>
                              <div className="text-center">
                                  <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">{p.artistName}</h3>
                                  <p className="text-cyan-500 font-bold uppercase text-xs tracking-widest mb-6">{p.trackTitle}</p>
                                  <button onClick={() => handleVote(p.id)} disabled={!!userVote} className={`px-10 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all ${userVote === p.id ? 'bg-green-500 text-slate-950' : 'bg-white text-slate-950 hover:scale-105 active:scale-95 disabled:opacity-30'}`}>
                                      {userVote === p.id ? 'Voted' : 'Vote Now'}
                                  </button>
                              </div>
                          </div>
                      ))}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <span className="text-[120px] font-black italic text-slate-900/50 select-none">VS</span>
                      </div>
                  </div>
              </div>

              {/* Sidebar: Chat */}
              <div className="w-80 bg-slate-900 border-l border-white/5 flex flex-col shrink-0">
                  <div className="p-6 border-b border-white/5 bg-slate-950">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Crowd Reaction</h4>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                      {chatMessages.map(msg => (
                          <div key={msg.id} className="text-xs">
                              {msg.isSystem ? (
                                  <div className="text-center py-2 text-indigo-400 font-bold uppercase tracking-tighter opacity-70">/// {msg.text}</div>
                              ) : (
                                  <p><span className="font-black text-slate-500 mr-2 uppercase">{msg.user}</span> <span className="text-slate-300">{msg.text}</span></p>
                              )}
                          </div>
                      ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-white/5 flex gap-2">
                      <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Reaction..." className="flex-1 bg-slate-900 border-none rounded-xl px-4 py-3 text-xs text-white outline-none focus:ring-1 ring-cyan-500" />
                      <button type="submit" className="p-3 bg-cyan-600 rounded-xl text-white hover:bg-cyan-500 transition-colors"><Send className="w-4 h-4" /></button>
                  </form>
              </div>
          </div>
      </div>
  );
};
