
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
  const [isPlaying, setIsPlaying] = useState<string | null>(null); // ID of participant playing
  const [timeLeft, setTimeLeft] = useState(300); // 5 mins mock
  const [userVote, setUserVote] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Tabbed Interface State
  const [activeTab, setActiveTab] = useState<'chat' | 'info' | 'stats'>('chat');
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{id: string, user: string, text: string, isSystem?: boolean}[]>([
      { id: '1', user: 'System', text: 'Welcome to the arena! Keep it clean.', isSystem: true },
      { id: '2', user: 'BeatMaker99', text: 'Blue side has crazy 808s!' },
      { id: '3', user: 'SarahJ', text: 'Red side vocals are cleaner tho.' },
  ]);

  // AI Commentary State (Marquee)
  const [tickerComment, setTickerComment] = useState("Battle in progress...");

  // Initialize Audio
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

  // Timer Countdown
  useEffect(() => {
      if (view === 'arena' && timeLeft > 0) {
          const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
          return () => clearInterval(timer);
      }
  }, [view, timeLeft]);

  // AI Commentary Interval
  useEffect(() => {
      if (view === 'arena' && activeBattle) {
          const interval = setInterval(async () => {
              if (activeBattle.participants.length < 2) return;
              
              const p1 = activeBattle.participants[0]?.artistName || 'Artist 1';
              const p2 = activeBattle.participants[1]?.artistName || 'Artist 2';
              const context = isPlaying ? "Music is pumping" : "Crowd is waiting";
              
              const comment = await generateBattleCommentary(activeBattle.genre, p1, p2, context);
              setTickerComment(comment);
              
              // Occasionally add to chat
              if (Math.random() > 0.7) {
                  setChatMessages(prev => [...prev, { id: `ai_${Date.now()}`, user: 'SoundForge AI', text: comment, isSystem: true }]);
              }
          }, 10000); 
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

  const handleNotify = (battleId: string) => {
      alert("Notification set! We'll alert you when the battle begins.");
  };

  const handleCreateBattle = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newBattleTitle) {
          alert("Please give your battle a title.");
          return;
      }

      // Create dummy placeholders for new battles
      const placeholder1: BattleParticipant = {
          id: `p_${Date.now()}_1`, artistName: "Waiting...", isAi: false, trackTitle: "-", audioUrl: "", image: "https://picsum.photos/400/400?grayscale", votes: 0
      };
      const placeholder2: BattleParticipant = {
          id: `p_${Date.now()}_2`, artistName: "Waiting...", isAi: true, trackTitle: "-", audioUrl: "", image: "https://picsum.photos/400/400?grayscale", votes: 0
      };

      const newBattle: Battle = {
          id: `bat_${Date.now()}`,
          title: newBattleTitle,
          description: "Custom battle created by user.",
          type: newConfig.format,
          genre: newBattleGenre,
          status: 'Upcoming',
          endTime: new Date(Date.now() + 86400000).toISOString(),
          totalVotes: 0,
          listeners: 0,
          config: { ...newConfig },
          participants: [placeholder1, placeholder2] // Initialize with slots
      };

      setBattles([newBattle, ...battles]);
      setShowCreateModal(false);
      alert("Battle Created! Challengers can now join.");
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
      // Add "Voted" message to chat
      setChatMessages(prev => [...prev, { id: `sys_${Date.now()}`, user: 'You', text: 'Voted successfully!', isSystem: true }]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;
      setChatMessages(prev => [...prev, { id: `msg_${Date.now()}`, user: 'You', text: chatInput }]);
      setChatInput('');
  };

  const formatTime = (s: number) => {
      const min = Math.floor(s / 60);
      const sec = s % 60;
      return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const getTimeRemaining = (endTime: string) => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;
      if (diff <= 0) return "0m";
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 24) return `${Math.floor(hours/24)}d left`;
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m left`;
  };

  const getCardStyles = (status: string) => {
      switch(status) {
          case 'Live': return 'bg-slate-900 border-red-500/50 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 hover:border-red-500';
          case 'Voting': return 'bg-slate-900 border-purple-500/50 shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:border-purple-500';
          case 'Upcoming': return 'bg-slate-900 border-blue-500/30 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/10';
          case 'Ended': return 'bg-slate-900 border-slate-800 opacity-75 hover:opacity-100 hover:border-slate-600 grayscale hover:grayscale-0';
          default: return 'bg-slate-900 border-slate-800 hover:border-cyan-500/50';
      }
  };

  // --- LOBBY VIEW ---
  if (view === 'lobby') {
      const filteredBattles = battles.filter(b => filter === 'All' || b.status === filter || b.type.includes(filter));

      return (
          <div className="space-y-8 animate-in fade-in pb-20 relative">
              {/* Hero */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 h-64 md:h-80 flex flex-col justify-center items-center text-center p-6 shadow-2xl">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/90"></div>
                  
                  <div className="relative z-10 max-w-3xl">
                      <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 md:mb-6 animate-pulse">
                          <Swords className="w-4 h-4" /> Live Arena
                      </div>
                      <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                          Where Music Competes.<br/>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">The Crowd Decides.</span>
                      </h1>
                      <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mt-6 md:mt-8">
                          <button 
                            onClick={() => setShowCreateModal(true)}
                            className="bg-white text-slate-950 px-6 md:px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 flex items-center justify-center gap-2"
                          >
                              <Plus className="w-5 h-5" /> Create Battle
                          </button>
                          <button className="bg-slate-800 text-white border border-slate-700 px-6 md:px-8 py-3 rounded-full font-bold hover:bg-slate-700 transition-colors">
                              Watch Live
                          </button>
                      </div>
                  </div>
              </div>

              {/* Filters */}
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide items-center -mx-4 px-4 md:mx-0 md:px-0">
                  <button 
                      onClick={() => setFilter('All')}
                      className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                          filter === 'All' 
                          ? 'bg-cyan-500 text-slate-950 shadow-md' 
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                      }`}
                  >
                      All
                  </button>
                  
                  <div className="w-px h-6 bg-slate-800 mx-2 shrink-0"></div>

                  {['Live', 'Upcoming', 'Ended'].map(f => (
                      <button 
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                              filter === f 
                              ? 'bg-cyan-500 text-slate-950 shadow-md' 
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                          }`}
                      >
                          {f}
                      </button>
                  ))}

                  <div className="w-px h-6 bg-slate-800 mx-2 shrink-0"></div>

                  {['AI Only', 'Human Only', 'Hybrid', 'Cover', 'Beat', 'DJ'].map(f => (
                      <button 
                          key={f}
                          onClick={() => setFilter(f)}
                          className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                              filter === f 
                              ? 'bg-purple-500 text-white shadow-md' 
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600'
                          }`}
                      >
                          {f}
                      </button>
                  ))}
              </div>

              {/* Battle Grid (Cards) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBattles.map(battle => (
                      <div 
                          key={battle.id} 
                          onClick={() => battle.status === 'Upcoming' ? handleNotify(battle.id) : enterBattle(battle)}
                          className={`rounded-xl overflow-hidden transition-all duration-300 group relative cursor-pointer flex flex-col border ${getCardStyles(battle.status)}`}
                      >
                          {/* Card Header / Visuals */}
                          <div className="h-48 bg-slate-800 relative overflow-hidden">
                              <div className="absolute inset-0 flex">
                                  {battle.participants[0] && (
                                      <img src={battle.participants[0].image} className="w-1/2 h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 group-hover:scale-105" />
                                  )}
                                  {battle.participants[1] && (
                                      <img src={battle.participants[1].image} className="w-1/2 h-full object-cover opacity-60 group-hover:opacity-80 transition-all duration-700 group-hover:scale-105" />
                                  )}
                              </div>
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                              
                              {/* VS Circle */}
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                                  <div className="w-10 h-10 bg-slate-950/80 backdrop-blur border border-white/10 rounded-full flex items-center justify-center font-black italic text-white text-sm shadow-xl group-hover:scale-110 transition-transform">
                                      VS
                                  </div>
                              </div>

                              {/* Badges Top Left */}
                              <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
                                  {battle.status === 'Live' && (
                                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-red-600 text-white animate-pulse flex items-center gap-1 shadow-sm">
                                          <span className="w-1.5 h-1.5 rounded-full bg-white"></span> Live
                                      </span>
                                  )}
                                  {battle.status === 'Voting' && (
                                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-purple-600 text-white flex items-center gap-1 shadow-sm">
                                          <Vote className="w-3 h-3" /> Voting
                                      </span>
                                  )}
                                  {battle.status === 'Upcoming' && (
                                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-600 text-white flex items-center gap-1 shadow-sm">
                                          <Calendar className="w-3 h-3" /> Soon
                                      </span>
                                  )}
                                  {battle.status === 'Ended' && (
                                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-700 text-slate-300 flex items-center gap-1 shadow-sm">
                                          Ended
                                      </span>
                                  )}
                                  <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-950/60 text-white border border-white/10 backdrop-blur">
                                      {battle.type}
                                  </span>
                              </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-5 flex-1 flex flex-col">
                              <div className="mb-1">
                                  <span className="text-xs font-bold text-cyan-500 uppercase tracking-wider mb-1 block">{battle.genre}</span>
                                  <h3 className="font-bold text-white text-xl group-hover:text-cyan-400 transition-colors line-clamp-1">{battle.title}</h3>
                              </div>
                              <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                                  {battle.description} 
                                  {battle.config.rewards.cash ? <span className="text-green-400 block mt-1 font-bold">Prize: ${battle.config.rewards.cash}</span> : null}
                              </p>

                              {/* NEW: Participant Stats */}
                              {battle.participants.some(p => p.creativityScore || p.soundScore) && (
                                  <div className="mt-auto mb-4 space-y-2 bg-black/20 p-2 rounded-lg border border-white/5">
                                      {battle.participants.map(p => (
                                          <div key={p.id} className="flex justify-between items-center text-[10px] text-slate-400">
                                              <div className="flex items-center gap-2">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-slate-600"></div>
                                                  <span className="font-bold truncate max-w-[100px] text-slate-300">{p.artistName}</span>
                                              </div>
                                              <div className="flex gap-3">
                                                  {p.creativityScore && (
                                                      <div className="flex items-center gap-1" title="Creativity Score">
                                                          <span className="text-purple-400">🎨</span>
                                                          <span className="font-mono">{p.creativityScore}</span>
                                                      </div>
                                                  )}
                                                  {p.soundScore && (
                                                      <div className="flex items-center gap-1" title="Sound Score">
                                                          <span className="text-cyan-400">🔊</span>
                                                          <span className="font-mono">{p.soundScore}</span>
                                                      </div>
                                                  )}
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              )}
                              
                              {/* Footer Stats */}
                              <div className="mt-auto pt-4 border-t border-slate-800/50 flex justify-between items-center text-xs font-medium text-slate-500">
                                  {/* Left: Time Status */}
                                  <div className="flex items-center gap-2">
                                      {battle.status === 'Live' ? (
                                          <span className="flex items-center gap-1.5 text-red-400 bg-red-400/10 px-2 py-1 rounded">
                                              <Clock className="w-3.5 h-3.5" /> 
                                              {getTimeRemaining(battle.endTime)}
                                          </span>
                                      ) : battle.status === 'Voting' ? (
                                          <span className="flex items-center gap-1.5 text-purple-400 bg-purple-400/10 px-2 py-1 rounded">
                                              <Clock className="w-3.5 h-3.5" /> 
                                              {getTimeRemaining(battle.endTime)} left
                                          </span>
                                      ) : battle.status === 'Upcoming' ? (
                                          <span className="flex items-center gap-1.5 text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                                              <Calendar className="w-3.5 h-3.5" /> 
                                              {new Date(battle.endTime).toLocaleDateString()}
                                          </span>
                                      ) : (
                                          <span className="flex items-center gap-1.5 text-slate-400 bg-slate-800 px-2 py-1 rounded">
                                              <CheckCircle2 className="w-3.5 h-3.5" /> Ended
                                          </span>
                                      )}
                                  </div>

                                  {/* Right: Counts */}
                                  <div className="flex items-center gap-3">
                                      {battle.status === 'Live' ? (
                                          <span className="flex items-center gap-1 text-slate-300">
                                              <Headphones className="w-3.5 h-3.5 text-slate-500" /> {battle.listeners}
                                          </span>
                                      ) : (
                                          <span className="flex items-center gap-1 text-slate-300">
                                              <Vote className="w-3.5 h-3.5 text-slate-500" /> {battle.totalVotes}
                                          </span>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Create Battle Modal */}
              {showCreateModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                          <button 
                              onClick={() => setShowCreateModal(false)}
                              className="absolute top-4 right-4 text-slate-500 hover:text-white"
                          >
                              <X className="w-6 h-6" />
                          </button>
                          
                          <div className="p-6 md:p-8">
                              <h2 className="text-2xl font-bold text-white mb-6">Create New Battle</h2>
                              
                              <form onSubmit={handleCreateBattle} className="space-y-6">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-400 mb-2">Battle Title</label>
                                      <input 
                                          type="text" 
                                          value={newBattleTitle}
                                          onChange={(e) => setNewBattleTitle(e.target.value)}
                                          placeholder="e.g. Best 808s in Town"
                                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                                      />
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="block text-xs font-bold text-slate-400 mb-2">Format</label>
                                          <select 
                                              value={newConfig.format}
                                              onChange={(e) => setNewConfig({...newConfig, format: e.target.value as any})}
                                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                                          >
                                              <option value="Hybrid">Hybrid (AI vs Human)</option>
                                              <option value="AI Only">AI Only</option>
                                              <option value="Human Only">Human Only</option>
                                              <option value="Beat">Beat Battle</option>
                                          </select>
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold text-slate-400 mb-2">Genre</label>
                                          <select 
                                              value={newBattleGenre}
                                              onChange={(e) => setNewBattleGenre(e.target.value)}
                                              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                                          >
                                              <option value="Pop">Pop</option>
                                              <option value="Hip Hop">Hip Hop</option>
                                              <option value="Trap">Trap</option>
                                              <option value="R&B">R&B</option>
                                              <option value="Electronic">Electronic</option>
                                          </select>
                                      </div>
                                  </div>

                                  <button 
                                      type="submit"
                                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-lg transition-colors"
                                  >
                                      Launch Arena
                                  </button>
                              </form>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // --- BATTLE ARENA VIEW ---
  if (!activeBattle) return null;

  return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col fixed inset-0 z-50">
          {/* Top Bar */}
          <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-4">
                  <button onClick={() => setView('lobby')} className="text-slate-400 hover:text-white font-bold text-sm">
                      ← Exit
                  </button>
                  <div className="h-6 w-px bg-slate-800 hidden md:block"></div>
                  <div>
                      <h2 className="font-bold text-sm md:text-lg flex items-center gap-2">
                          {activeBattle.title}
                          <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded uppercase animate-pulse">Live</span>
                      </h2>
                  </div>
              </div>
              <div className="flex items-center gap-3 md:gap-6">
                  <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm">
                      <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
                  </div>
                  <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full text-xs font-mono">
                      <Headphones className="w-3 h-3 text-cyan-400" /> {activeBattle.listeners + 1}
                  </div>
              </div>
          </div>

          {/* AI Commentary Ticker */}
          <div className="bg-slate-950 border-b border-slate-800 py-1 overflow-hidden relative shrink-0">
              <div className="whitespace-nowrap animate-[marquee_20s_linear_infinite] text-xs font-mono text-cyan-400/80">
                  <span className="mx-4">🤖 AI Commentary: {tickerComment}</span>
                  <span className="mx-4 text-slate-600">///</span>
                  <span className="mx-4">🤖 AI Commentary: {tickerComment}</span>
                  <span className="mx-4 text-slate-600">///</span>
                  <span className="mx-4">🤖 AI Commentary: {tickerComment}</span>
              </div>
          </div>

          {/* Main Stage Container (Responsive Split) */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              
              {/* STAGE AREA (Top/Left) */}
              <div className="flex-1 bg-slate-950 relative flex flex-col overflow-y-auto md:overflow-hidden min-h-[50%] md:min-h-0">
                  {/* Visualizer Background Placeholder */}
                  <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
                      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-gradient-to-r from-red-500/20 via-transparent to-blue-500/20 animate-spin-slow duration-[20s]`}></div>
                  </div>

                  {/* Players */}
                  <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 md:p-12 gap-8 md:gap-16 z-10">
                      {activeBattle.participants.map((p, i) => {
                          const isRed = i === 0;
                          const colorClass = isRed ? 'text-red-500' : 'text-blue-500';
                          const bgClass = isRed ? 'bg-red-500' : 'bg-blue-500';
                          const playing = isPlaying === p.id;

                          return (
                              <div key={p.id} className="flex flex-col items-center gap-4 md:gap-6 relative w-full md:w-auto">
                                  {/* Avatar Circle with Pulse */}
                                  <div className="relative group">
                                      {/* Responsive Avatar Size: smaller on mobile */}
                                      <div className={`w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-full border-4 ${isRed ? 'border-red-500' : 'border-blue-500'} p-1 relative z-10 bg-slate-900`}>
                                          <img src={p.image} className="w-full h-full rounded-full object-cover" />
                                          
                                          {/* Play Overlay */}
                                          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => handlePlay(p)}>
                                              {playing ? <Pause className="w-8 h-8 md:w-12 md:h-12 text-white" /> : <Play className="w-8 h-8 md:w-12 md:h-12 text-white ml-1 md:ml-2" />}
                                          </div>
                                      </div>
                                      {/* Audio Visualizer Ring (Fake) */}
                                      {playing && (
                                          <div className={`absolute -inset-4 rounded-full border-2 ${isRed ? 'border-red-500/50' : 'border-blue-500/50'} animate-ping opacity-20`}></div>
                                      )}
                                  </div>

                                  <div className="text-center">
                                      <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{p.artistName}</h3>
                                      <p className={`text-xs md:text-sm font-bold ${colorClass} uppercase tracking-wider`}>{p.trackTitle}</p>
                                      
                                      <div className="mt-4 flex gap-4 justify-center">
                                          <button 
                                              onClick={() => handleVote(p.id)}
                                              disabled={!!userVote}
                                              className={`px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 transition-all ${
                                                  userVote === p.id 
                                                  ? 'bg-white text-slate-900' 
                                                  : userVote 
                                                      ? 'bg-slate-800 text-slate-500 opacity-50' 
                                                      : `${bgClass} text-white hover:scale-105 shadow-lg`
                                              }`}
                                          >
                                              {userVote === p.id ? <CheckCircle2 className="w-4 h-4" /> : <Vote className="w-4 h-4" />}
                                              {userVote === p.id ? 'Voted' : 'Vote'}
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                      
                      {/* VS Divider - Hidden on mobile to save vertical space */}
                      <div className="hidden md:flex flex-col items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                          <div className="text-6xl font-black italic text-slate-800 select-none opacity-50">VS</div>
                      </div>
                  </div>
              </div>

              {/* SIDEBAR: CHAT & STATS (Bottom/Right) */}
              <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col shrink-0 h-[50%] md:h-auto">
                  <div className="flex border-b border-slate-800 shrink-0">
                      <button 
                          onClick={() => setActiveTab('chat')}
                          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'chat' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800' : 'text-slate-500 hover:text-white'}`}
                      >
                          Live Chat
                      </button>
                      <button 
                          onClick={() => setActiveTab('stats')}
                          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${activeTab === 'stats' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800' : 'text-slate-500 hover:text-white'}`}
                      >
                          Stats
                      </button>
                  </div>

                  {activeTab === 'chat' ? (
                      <div className="flex-1 flex flex-col overflow-hidden">
                          <div className="flex-1 overflow-y-auto p-4 space-y-3">
                              {chatMessages.map((msg) => (
                                  <div key={msg.id} className={`text-sm ${msg.isSystem ? 'text-center my-4 opacity-70' : ''}`}>
                                      {msg.isSystem ? (
                                          <span className="text-xs bg-slate-800 text-cyan-400 px-2 py-1 rounded-full border border-cyan-900">{msg.text}</span>
                                      ) : (
                                          <p>
                                              <span className="font-bold text-slate-400 mr-2">{msg.user}:</span>
                                              <span className="text-slate-200">{msg.text}</span>
                                          </p>
                                      )}
                                  </div>
                              ))}
                          </div>
                          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2 shrink-0">
                              <input 
                                  type="text" 
                                  value={chatInput}
                                  onChange={(e) => setChatInput(e.target.value)}
                                  placeholder="Say something..."
                                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                              />
                              <button type="submit" className="bg-cyan-600 p-2 rounded-lg text-white hover:bg-cyan-500">
                                  <Send className="w-4 h-4" />
                              </button>
                          </form>
                      </div>
                  ) : (
                      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                          <div>
                              <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Live Voting</h4>
                              <div className="space-y-4">
                                  {activeBattle.participants.map((p, i) => {
                                      const total = activeBattle.totalVotes || 1; // avoid div by 0
                                      const percent = Math.round(((p.votes + (userVote === p.id ? 1 : 0)) / total) * 100);
                                      const isRed = i === 0;
                                      
                                      return (
                                          <div key={p.id}>
                                              <div className="flex justify-between text-xs mb-1">
                                                  <span className="font-bold text-white">{p.artistName}</span>
                                                  <span className="text-slate-400">{percent}%</span>
                                              </div>
                                              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                  <div className={`h-full ${isRed ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${percent}%` }}></div>
                                              </div>
                                          </div>
                                      );
                                  })}
                              </div>
                          </div>

                          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Battle Info</h4>
                              <p className="text-xs text-slate-300 mb-2">{activeBattle.description}</p>
                              <div className="flex flex-wrap gap-2">
                                  {activeBattle.config.customRules.map((rule, i) => (
                                      <span key={i} className="text-[10px] bg-slate-900 border border-slate-600 px-2 py-1 rounded text-slate-400">
                                          {rule}
                                      </span>
                                  ))}
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>
  );
};
