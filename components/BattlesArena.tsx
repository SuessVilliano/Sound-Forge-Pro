
import React, { useState, useRef, useEffect } from 'react';
// Added Zap to the lucide-react imports to fix the error on line 365
import { Swords, Play, Pause, Vote, MessageSquare, Share2, Flame, Users, Clock, Bot, User, Mic2, AlertCircle, Headphones, Bell, Send, Info, BarChart2, Shield, Music, ThumbsUp, Calendar, CheckCircle2, Plus, Gavel, Award, DollarSign, X, ChevronUp, ChevronDown, Sliders, Target, Trophy, Zap } from 'lucide-react';
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
  const [newBattleTitle, setNewBattleTitle] = useState('');
  const [newBattleDescription, setNewBattleDescription] = useState('');
  const [newBattleGenre, setNewBattleGenre] = useState('Pop');
  const [newBattleType, setNewBattleType] = useState<'Hybrid' | 'AI Only' | 'Human Only'>('Hybrid');
  const [newConfig, setNewConfig] = useState<BattleRulesConfig>({
      maxDurationSeconds: 180,
      format: '1v1 Knockout',
      votingWindow: 'Live (5 mins)',
      maxEntries: 2,
      rewards: { xp: 500, cash: 100, badge: 'Arena Pioneer' },
      customRules: []
  });

  // --- ARENA STATE ---
  const [isPlaying, setIsPlaying] = useState<string | null>(null); 
  const [timeLeft, setTimeLeft] = useState(300); 
  const [userVote, setUserVote] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
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
      setShowChatOnMobile(false);
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

  const createBattle = () => {
    const newBattle: Battle = {
        id: `b_${Date.now()}`,
        title: newBattleTitle || 'New Institutional Battle',
        description: newBattleDescription || 'Competitive audio analysis session.',
        type: newBattleType,
        genre: newBattleGenre,
        status: 'Upcoming',
        endTime: new Date(Date.now() + 86400000).toISOString(), // 24h from now
        totalVotes: 0,
        listeners: 1,
        config: newConfig,
        participants: []
    };
    setBattles([newBattle, ...battles]);
    setShowCreateModal(false);
    // Reset state
    setNewBattleTitle('');
    setNewBattleDescription('');
  };

  if (view === 'lobby') {
      const filteredBattles = battles.filter(b => 
          filter === 'All' || 
          b.status === filter || 
          b.type === filter ||
          b.genre === filter
      );

      return (
          <div className="space-y-6 md:space-y-8 animate-in fade-in pb-24 px-4 md:px-0">
              <div className="relative rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[250px] md:h-64 flex flex-col justify-center p-6 md:p-12 shadow-2xl">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none"></div>
                  <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 md:mb-6 animate-pulse">
                          <Zap className="w-3 h-3" /> Live Arena Active
                      </div>
                      <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2 md:mb-4">The Merge Arena</h1>
                      <p className="text-slate-500 text-xs md:text-sm max-w-md font-medium">The proving ground for AI and human creators. Secure your reputation and earn $MERGE rewards.</p>
                  </div>
                  <button onClick={() => setShowCreateModal(true)} className="md:absolute md:top-12 md:right-12 mt-6 md:mt-0 w-full md:w-auto bg-slate-950 text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-black/20">
                      <Plus className="w-4 h-4" /> Initialize Battle
                  </button>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2 items-center overflow-x-auto scrollbar-hide pb-2">
                  <button onClick={() => setFilter('All')} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${filter === 'All' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>All Arena</button>
                  <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-2 shrink-0"></div>
                  {['Live', 'Voting', 'Upcoming', 'AI Only', 'Hybrid', 'Beat'].map(f => (
                      <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${filter === f ? 'bg-cyan-500 text-slate-950' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>{f}</button>
                  ))}
              </div>

              {/* Battle Grid */}
              {filteredBattles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                      {filteredBattles.map(battle => (
                          <div key={battle.id} onClick={() => enterBattle(battle)} className={`bg-white dark:bg-slate-900 border rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] ${getCardStyles(battle.status)}`}>
                              <div className="h-40 md:h-44 relative bg-slate-800">
                                  <div className="absolute inset-0 flex">
                                      <img src={battle.participants[0]?.image || 'https://picsum.photos/400/400?random=1'} className="w-1/2 h-full object-cover opacity-60" />
                                      <img src={battle.participants[1]?.image || 'https://picsum.photos/400/400?random=2'} className="w-1/2 h-full object-cover opacity-60" />
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="bg-slate-950/80 border border-white/20 w-10 h-10 rounded-full flex items-center justify-center font-black italic text-xs">VS</div>
                                  </div>
                                  <div className="absolute top-4 left-4 flex gap-2">
                                      {battle.status === 'Live' && <span className="bg-red-600 text-white text-[8px] px-2 py-0.5 rounded font-black uppercase animate-pulse">Live</span>}
                                      <span className="bg-slate-950/60 text-white text-[8px] px-2 py-0.5 rounded font-black uppercase tracking-widest">{battle.type}</span>
                                  </div>
                              </div>
                              <div className="p-6">
                                  <div className="flex justify-between items-start mb-2 gap-2">
                                      <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1 italic">{battle.title}</h3>
                                      <span className="text-[10px] font-black text-cyan-500 uppercase shrink-0">{battle.genre}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 line-clamp-2 mb-6 font-medium">{battle.description}</p>
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
                      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-4xl p-10 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
                          <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                              <Swords className="w-48 h-48 text-white" />
                          </div>
                          
                          <div className="flex justify-between items-center mb-8 shrink-0">
                              <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                                <Plus className="w-8 h-8 text-cyan-500" /> Initialize Battle Node
                              </h2>
                              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white p-2 bg-slate-800 rounded-full transition-colors"><X className="w-6 h-6"/></button>
                          </div>

                          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-10">
                              {/* Phase 1: Core Identity */}
                              <section className="space-y-6">
                                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-3">Operational Identity</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div>
                                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Battle Title</label>
                                          <input 
                                            placeholder="e.g. Genesis Protocol" 
                                            value={newBattleTitle} 
                                            onChange={e => setNewBattleTitle(e.target.value)} 
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:border-cyan-500 transition-all" 
                                          />
                                      </div>
                                      <div>
                                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Genre Constraint</label>
                                          <select 
                                            value={newBattleGenre}
                                            onChange={e => setNewBattleGenre(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:border-cyan-500 appearance-none"
                                          >
                                              <option>Pop</option><option>Hip Hop</option><option>Trap</option><option>Lo-Fi</option><option>Electronic</option><option>Cinematic</option>
                                          </select>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Operational Description</label>
                                      <textarea 
                                        placeholder="Describe the battle format and expectations..." 
                                        value={newBattleDescription}
                                        onChange={e => setNewBattleDescription(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white font-medium outline-none focus:border-cyan-500 h-24 resize-none transition-all" 
                                      />
                                  </div>
                              </section>

                              {/* Phase 2: Engagement Rules */}
                              <section className="space-y-6">
                                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-3">Engagement Protocol</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                      <div>
                                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5"><Sliders className="w-3 h-3" /> Entity Format</label>
                                          <div className="grid grid-cols-1 gap-2">
                                              {['Hybrid', 'AI Only', 'Human Only'].map((type) => (
                                                  <button
                                                      key={type}
                                                      onClick={() => setNewBattleType(type as any)}
                                                      className={`px-4 py-2 text-[10px] font-black rounded-lg border transition-all uppercase tracking-widest ${newBattleType === type ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                                  >
                                                      {type}
                                                  </button>
                                              ))}
                                          </div>
                                      </div>
                                      <div>
                                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5"><Target className="w-3 h-3" /> Battle Format</label>
                                          <select 
                                            value={newConfig.format}
                                            onChange={e => setNewConfig({...newConfig, format: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:border-cyan-500 appearance-none text-xs"
                                          >
                                              <option>1v1 Knockout</option><option>4-Artist Melee</option><option>Tournament Bracket</option>
                                          </select>
                                      </div>
                                      <div>
                                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Max Duration</label>
                                          <select 
                                            value={newConfig.maxDurationSeconds}
                                            onChange={e => setNewConfig({...newConfig, maxDurationSeconds: parseInt(e.target.value)})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:border-cyan-500 appearance-none text-xs"
                                          >
                                              <option value={60}>60 Seconds</option><option value={180}>180 Seconds</option><option value={300}>300 Seconds</option>
                                          </select>
                                      </div>
                                  </div>
                              </section>

                              {/* Phase 3: Rewards Ledger */}
                              <section className="space-y-6">
                                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-3">Reward Allocation</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                      <div className="bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 space-y-6">
                                          <div className="flex items-center gap-3">
                                              <div className="p-3 bg-indigo-500/10 rounded-xl"><Trophy className="w-5 h-5 text-indigo-400" /></div>
                                              <div>
                                                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Reputation Yield</div>
                                                  <div className="text-xl font-black text-white">{newConfig.rewards.xp} XP</div>
                                              </div>
                                          </div>
                                          <input 
                                            type="range" min="100" max="5000" step="100"
                                            value={newConfig.rewards.xp}
                                            onChange={e => setNewConfig({...newConfig, rewards: {...newConfig.rewards, xp: parseInt(e.target.value)}})}
                                            className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                                          />
                                      </div>
                                      <div className="bg-slate-950 border border-slate-800 rounded-[1.5rem] p-6 space-y-6">
                                          <div className="flex items-center gap-3">
                                              <div className="p-3 bg-green-500/10 rounded-xl"><DollarSign className="w-5 h-5 text-green-400" /></div>
                                              <div>
                                                  <div className="text-[10px] font-black text-green-400 uppercase tracking-widest">Cash Advance Reward</div>
                                                  <div className="text-xl font-black text-white">${newConfig.rewards.cash}</div>
                                              </div>
                                          </div>
                                          <input 
                                            type="range" min="0" max="1000" step="50"
                                            value={newConfig.rewards.cash}
                                            onChange={e => setNewConfig({...newConfig, rewards: {...newConfig.rewards, cash: parseInt(e.target.value)}})}
                                            className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-green-500"
                                          />
                                      </div>
                                  </div>
                              </section>
                          </div>

                          <div className="pt-8 mt-4 border-t border-slate-800 shrink-0">
                              <button 
                                onClick={createBattle} 
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-2xl shadow-indigo-600/20 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99]"
                              >
                                <Zap className="w-4 h-4 fill-white" /> Authorize Arena Deployment
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  if (!activeBattle) return null;

  return (
      <div className="min-h-screen bg-black text-white flex flex-col fixed inset-0 z-[100] animate-in slide-in-from-bottom-4 overflow-hidden">
          <div className="h-16 md:h-20 bg-slate-900 border-b border-white/5 flex items-center justify-between px-4 md:px-8 shrink-0">
              <div className="flex items-center gap-3 md:gap-6 min-w-0">
                  <button onClick={() => setView('lobby')} className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors shrink-0">← <span className="hidden sm:inline">Exit Arena</span></button>
                  <h2 className="font-black uppercase tracking-tight text-sm md:text-xl truncate italic">{activeBattle.title}</h2>
                  <div className="hidden lg:flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full">
                      <span className="text-[10px] font-black uppercase text-indigo-400">{activeBattle.type} Challenge</span>
                  </div>
              </div>
              <div className="flex items-center gap-2 md:gap-6 min-w-0">
                  <div className="text-red-500 font-black text-[10px] md:text-sm uppercase flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0"></span> <span className="truncate">{tickerComment}</span>
                  </div>
              </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              {/* Main Arena Content */}
              <div className="flex-1 relative flex flex-col items-center justify-center p-4 md:p-12 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 relative z-10 w-full max-w-5xl py-8">
                      {activeBattle.participants.map((p, i) => (
                          <div key={p.id} className="flex flex-col items-center gap-6 md:gap-8">
                              <div className="relative">
                                  <div className={`relative group w-36 h-36 md:w-64 md:h-64 rounded-full p-1 border-4 transition-all duration-700 ${isPlaying === p.id ? 'border-cyan-400 scale-105 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'border-slate-800 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'}`}>
                                      <img src={p.image} className="w-full h-full rounded-full object-cover" />
                                      <button onClick={() => handlePlay(p)} className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-full transition-all">
                                          {isPlaying === p.id ? <Pause className="w-10 h-10 md:w-12 md:h-12 fill-white" /> : <Play className="w-10 h-10 md:w-12 md:h-12 fill-white ml-2" />}
                                      </button>
                                  </div>
                                  
                                  {/* Identity Badge */}
                                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/20 rounded-full px-4 py-1 flex items-center gap-2 shadow-xl whitespace-nowrap z-20">
                                      {p.isAi ? (
                                          <>
                                            <Bot className="w-3 h-3 text-purple-400" />
                                            <span className="text-[9px] font-black uppercase text-purple-400 tracking-widest">AI Entity</span>
                                          </>
                                      ) : (
                                          <>
                                            <User className="w-3 h-3 text-cyan-400" />
                                            <span className="text-[9px] font-black uppercase text-cyan-400 tracking-widest">Human Artist</span>
                                          </>
                                      )}
                                  </div>
                              </div>

                              <div className="text-center w-full max-w-[280px] md:max-w-none">
                                  <h3 className="text-xl md:text-3xl font-black uppercase tracking-tighter mb-1 md:mb-2 truncate">{p.artistName}</h3>
                                  <p className="text-cyan-500 font-bold uppercase text-[9px] md:text-[10px] tracking-widest mb-4 md:mb-6 truncate">{p.trackTitle}</p>
                                  
                                  <div className="bg-slate-900/50 backdrop-blur border border-white/5 p-3 md:p-4 rounded-2xl mb-4 md:mb-6 min-w-[120px] md:min-w-[160px]">
                                      <div className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Benchmarking</div>
                                      <div className="text-lg md:text-2xl font-black text-white">{p.votes.toLocaleString()} <span className="text-[8px] md:text-[10px] text-slate-600">PTS</span></div>
                                  </div>

                                  <button onClick={() => handleVote(p.id)} disabled={!!userVote} className={`w-full md:w-auto px-8 md:px-10 py-3 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest transition-all shadow-xl ${userVote === p.id ? 'bg-green-500 text-slate-950' : 'bg-white text-slate-950 hover:scale-105 active:scale-95 disabled:opacity-30'}`}>
                                      {userVote === p.id ? 'Identity Verified' : 'Confirm Consensus'}
                                  </button>
                              </div>
                          </div>
                      ))}
                      
                      {/* VS Divider on Mobile / Desktop */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
                          <span className="text-[60px] md:text-[120px] font-black italic text-slate-900/20 select-none tracking-tighter uppercase whitespace-nowrap">Crossover</span>
                      </div>
                  </div>
              </div>

              {/* Sidebar: Chat (Slide up on Mobile, Right on Desktop) */}
              <div className={`
                fixed inset-x-0 bottom-0 z-40 bg-slate-900 border-t md:border-t-0 md:border-l border-white/5 flex flex-col shrink-0 transition-transform duration-500 ease-in-out
                ${showChatOnMobile ? 'translate-y-0 h-[60vh]' : 'translate-y-full h-0 md:translate-y-0 md:h-auto md:w-80 md:relative'}
              `}>
                  <div className="p-4 md:p-6 border-b border-white/5 bg-slate-950 flex items-center justify-between shrink-0">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Crowd Reaction</h4>
                      <button onClick={() => setShowChatOnMobile(false)} className="md:hidden text-slate-500 hover:text-white p-1">
                          <ChevronDown className="w-5 h-5" />
                      </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 md:space-y-4 custom-scrollbar">
                      {chatMessages.map(msg => (
                          <div key={msg.id} className="text-[11px] md:text-xs">
                              {msg.isSystem ? (
                                  <div className="text-center py-2 text-indigo-400 font-bold uppercase tracking-tighter opacity-70">/// {msg.text}</div>
                              ) : (
                                  <p><span className="font-black text-slate-500 mr-2 uppercase">{msg.user}</span> <span className="text-slate-300">{msg.text}</span></p>
                              )}
                          </div>
                      ))}
                  </div>
                  <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-white/5 flex gap-2 shrink-0">
                      <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Reaction..." className="flex-1 bg-slate-900 border-none rounded-xl px-4 py-3 text-xs text-white outline-none focus:ring-1 ring-cyan-500" />
                      <button type="submit" className="p-3 bg-cyan-600 rounded-xl text-white hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20"><Send className="w-4 h-4" /></button>
                  </form>
              </div>

              {/* Mobile Chat Toggle Button */}
              {!showChatOnMobile && (
                  <button 
                    onClick={() => setShowChatOnMobile(true)}
                    className="md:hidden fixed bottom-6 right-6 z-50 bg-indigo-600 p-4 rounded-full shadow-2xl text-white animate-bounce"
                  >
                      <MessageSquare className="w-6 h-6" />
                  </button>
              )}
          </div>
      </div>
  );
};
