
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
                          
                          <div className="p-6 border-b border-slate-800 bg-slate-950 sticky top-0 z-10">
                              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                  <Swords className="w-6 h-6 text-cyan-500" /> Create New Battle
                              </h2>
                              <p className="text-slate-400 text-sm mt-1">Configure the rules engine for your showdown.</p>
                          </div>

                          <form onSubmit={handleCreateBattle} className="p-6 space-y-6">
                              <div>
                                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Battle Title</label>
                                  <input 
                                      required
                                      type="text" 
                                      value={newBattleTitle}
                                      onChange={(e) => setNewBattleTitle(e.target.value)}
                                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none font-bold"
                                      placeholder="e.g. Hyperpop Speed Run"
                                  />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Format</label>
                                      <select 
                                          value={newConfig.format}
                                          onChange={(e) => setNewConfig({...newConfig, format: e.target.value as any})}
                                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                                      >
                                          {['AI Only', 'Human Only', 'Hybrid', 'Cover', 'Beat', 'DJ'].map(f => (
                                              <option key={f} value={f}>{f}</option>
                                          ))}
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Genre</label>
                                      <select 
                                          value={newBattleGenre}
                                          onChange={(e) => setNewBattleGenre(e.target.value)}
                                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                                      >
                                          {['Pop', 'Hip Hop', 'Trap', 'Electronic', 'Lo-Fi', 'Rock', 'R&B', 'Global Bass', 'Hyperpop'].map(g => (
                                              <option key={g} value={g}>{g}</option>
                                          ))}
                                      </select>
                                  </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Song Length (Max Sec)</label>
                                      <input 
                                          type="number" 
                                          value={newConfig.maxDurationSeconds}
                                          onChange={(e) => setNewConfig({...newConfig, maxDurationSeconds: parseInt(e.target.value)})}
                                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Voting Window</label>
                                      <select 
                                          value={newConfig.votingWindow}
                                          onChange={(e) => setNewConfig({...newConfig, votingWindow: e.target.value as any})}
                                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                                      >
                                          <option value="Live">Live Only</option>
                                          <option value="24h">24 Hours</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Max Entries</label>
                                      <input 
                                          type="number" 
                                          value={newConfig.maxEntries}
                                          onChange={(e) => setNewConfig({...newConfig, maxEntries: parseInt(e.target.value)})}
                                          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none"
                                          disabled
                                      />
                                      <span className="text-[10px] text-slate-500">Fixed to 2 for Beta</span>
                                  </div>
                              </div>

                              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                                  <label className="block text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                                      <Award className="w-4 h-4 text-yellow-500" /> Rewards & Stakes
                                  </label>
                                  <div className="grid grid-cols-2 gap-4">
                                      <div>
                                          <label className="text-xs text-slate-500 block mb-1">XP Reward</label>
                                          <input 
                                              type="number" 
                                              value={newConfig.rewards.xp}
                                              onChange={(e) => setNewConfig({...newConfig, rewards: {...newConfig.rewards, xp: parseInt(e.target.value)}})}
                                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                                          />
                                      </div>
                                      <div>
                                          <label className="text-xs text-slate-500 block mb-1">Cash Prize ($)</label>
                                          <input 
                                              type="number" 
                                              value={newConfig.rewards.cash || 0}
                                              onChange={(e) => setNewConfig({...newConfig, rewards: {...newConfig.rewards, cash: parseInt(e.target.value)}})}
                                              className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                                          />
                                      </div>
                                  </div>
                              </div>

                              <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-lg flex items-start gap-3">
                                  <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />
                                  <div className="text-sm text-yellow-200">
                                      <span className="font-bold block mb-1">Immutable Rules</span>
                                      Once the battle is created, these parameters cannot be changed. Ensure all settings are correct before launching.
                                  </div>
                              </div>

                              <button 
                                  type="submit"
                                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg transition-all"
                              >
                                  Launch Battle
                              </button>
                          </form>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  const p1 = activeBattle.participants[0] || { id: 'p1', artistName: 'Waiting...', image: 'https://picsum.photos/400', trackTitle: '-', audioUrl: '' };
  const p2 = activeBattle.participants[1] || { id: 'p2', artistName: 'Waiting...', image: 'https://picsum.photos/400', trackTitle: '-', audioUrl: '' };

  // Use real votes if available from mock data, otherwise fallback to calculated display votes
  const realP1Votes = p1.votes || 0;
  const realP2Votes = p2.votes || 0;
  const useRealVotes = realP1Votes > 0 || realP2Votes > 0;

  const totalDisplayVotes = useRealVotes ? (realP1Votes + realP2Votes) : (activeBattle.totalVotes + (userVote ? 1 : 0));
  
  const p1Votes = useRealVotes 
      ? realP1Votes + (userVote === p1.id ? 1 : 0) 
      : Math.floor(totalDisplayVotes * 0.48) + (userVote === p1.id ? 1 : 0);
      
  const p2Votes = useRealVotes 
      ? realP2Votes + (userVote === p2.id ? 1 : 0)
      : totalDisplayVotes - p1Votes;

  const p1Percent = totalDisplayVotes > 0 ? Math.round((p1Votes / totalDisplayVotes) * 100) : 50;
  const p2Percent = 100 - p1Percent;

  // Determine Winner Status
  const isEnded = activeBattle.status === 'Ended';
  // If tied, no winner
  const winnerId = isEnded ? (p1Votes > p2Votes ? p1.id : p2Votes > p1Votes ? p2.id : 'tie') : null;

  return (
      <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-100px)] flex flex-col animate-in zoom-in-95 duration-300 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden relative">
          
          {/* Header */}
          <div className="h-14 md:h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
              <div className="flex items-center gap-3 md:gap-4">
                  <button onClick={() => setView('lobby')} className="text-slate-400 hover:text-white text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="text-lg leading-none">&larr;</span> Exit
                  </button>
                  <div className="h-6 w-px bg-slate-700 hidden md:block"></div>
                  <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3">
                      <h2 className="font-bold text-white text-xs md:text-sm line-clamp-1">{activeBattle.title}</h2>
                      <div className="flex items-center gap-2 text-[10px] md:text-xs text-slate-500">
                          {isEnded ? (
                              <span className="flex items-center gap-1 text-slate-400"><CheckCircle2 className="w-3 h-3" /> ENDED</span>
                          ) : (
                              <span className="flex items-center gap-1 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span> LIVE</span>
                          )}
                          <span className="hidden md:inline">•</span>
                          <span className="hidden md:inline">{activeBattle.type} Battle</span>
                      </div>
                  </div>
              </div>
              <div className="flex items-center gap-3">
                  <div className="text-sm md:text-2xl font-mono font-bold text-white tabular-nums tracking-widest bg-slate-900 px-2 md:px-3 py-1 rounded border border-slate-800 md:border-none">
                      {isEnded ? "FINAL" : formatTime(timeLeft)}
                  </div>
                  <button className="hidden md:block p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
                      <Share2 className="w-5 h-5" />
                  </button>
              </div>
          </div>

          {/* MAIN STAGE (Player) */}
          <div className="flex-[1.5] flex flex-col md:flex-row relative min-h-[300px] md:min-h-[400px]">
              
              {/* Player - Artist 1 */}
              <div className={`flex-1 relative transition-all duration-500 group ${isPlaying === p1.id ? 'flex-[1.2] md:flex-[1.2]' : 'flex-1'} border-b md:border-b-0 md:border-r border-slate-800 ${isEnded && winnerId !== p1.id && winnerId !== 'tie' ? 'opacity-50 grayscale' : ''}`}>
                  <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity" style={{ backgroundImage: `url(${p1.image})` }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
                  
                  {/* Playing Indicator */}
                  {isPlaying === p1.id && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-cyan-500/20 animate-ping"></div>
                          <div className="absolute w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-cyan-500/40 animate-ping delay-75"></div>
                      </div>
                  )}

                  {/* WINNER BADGE P1 */}
                  {isEnded && winnerId === p1.id && (
                      <div className="absolute top-6 left-6 z-20 animate-in zoom-in slide-in-from-top-4 duration-700">
                          <div className="bg-yellow-500 text-black font-black text-sm md:text-base px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.6)] flex items-center gap-2 transform -rotate-3 border-2 border-white">
                              <Award className="w-5 h-5" /> WINNER
                          </div>
                      </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-10 flex flex-col items-center text-center">
                      <div className="mb-2 md:mb-4 relative">
                          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 overflow-hidden shadow-2xl ${winnerId === p1.id ? 'border-yellow-500 shadow-yellow-500/20' : 'border-slate-800'}`}>
                              <img src={p1.image} className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-cyan-600 text-white text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-slate-900">
                              {p1.isAi ? 'AI Model' : 'Human'}
                          </div>
                      </div>
                      
                      <h3 className="text-lg md:text-xl font-bold text-white mb-0.5">{p1.artistName}</h3>
                      <p className="text-slate-400 text-[10px] md:text-xs mb-3 md:mb-6 max-w-[80%] truncate">{p1.trackTitle}</p>

                      <div className="flex gap-3 md:gap-4">
                          <button 
                              onClick={() => handlePlay(p1)}
                              disabled={!p1.audioUrl}
                              className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-xl ${isPlaying === p1.id ? 'bg-cyan-500 text-slate-950' : 'bg-white text-slate-950 hover:bg-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                          >
                              {isPlaying === p1.id ? <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <Play className="w-5 h-5 md:w-6 md:h-6 ml-1 fill-current" />}
                          </button>

                          <button 
                              onClick={() => handleVote(p1.id)}
                              disabled={!!userVote || !p1.audioUrl || isEnded}
                              className={`px-4 md:px-6 rounded-full font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 transition-all ${
                                  isEnded 
                                    ? winnerId === p1.id 
                                        ? 'bg-yellow-500 text-black ring-4 ring-yellow-500/20 opacity-100' 
                                        : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                                    : userVote === p1.id 
                                        ? 'bg-green-500 text-white ring-4 ring-green-500/20' 
                                        : userVote 
                                            ? 'bg-slate-800 text-slate-500 opacity-50'
                                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                              }`}
                          >
                              {isEnded 
                                ? (winnerId === p1.id ? <><Award className="w-4 h-4" /> Winner</> : 'Defeated')
                                : (userVote === p1.id ? 'Voted' : <><Flame className="w-3 h-3 md:w-4 md:h-4" /> Vote</>)
                              }
                          </button>
                      </div>
                  </div>
              </div>

              {/* VS Divider */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center pointer-events-none">
                  <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-950 border-2 border-white/20 rounded-full flex items-center justify-center font-black italic text-white text-sm md:text-xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                      VS
                  </div>
              </div>

              {/* Player - Artist 2 */}
              <div className={`flex-1 relative transition-all duration-500 group ${isPlaying === p2.id ? 'flex-[1.2] md:flex-[1.2]' : 'flex-1'} ${isEnded && winnerId !== p2.id && winnerId !== 'tie' ? 'opacity-50 grayscale' : ''}`}>
                  <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity" style={{ backgroundImage: `url(${p2.image})` }}></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>

                   {/* Playing Indicator */}
                   {isPlaying === p2.id && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-purple-500/20 animate-ping"></div>
                          <div className="absolute w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-purple-500/40 animate-ping delay-75"></div>
                      </div>
                  )}

                  {/* WINNER BADGE P2 */}
                  {isEnded && winnerId === p2.id && (
                      <div className="absolute top-6 left-6 z-20 animate-in zoom-in slide-in-from-top-4 duration-700">
                          <div className="bg-yellow-500 text-black font-black text-sm md:text-base px-4 py-2 rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.6)] flex items-center gap-2 transform -rotate-3 border-2 border-white">
                              <Award className="w-5 h-5" /> WINNER
                          </div>
                      </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-10 flex flex-col items-center text-center">
                      <div className="mb-2 md:mb-4 relative">
                          <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full border-4 overflow-hidden shadow-2xl ${winnerId === p2.id ? 'border-yellow-500 shadow-yellow-500/20' : 'border-slate-800'}`}>
                              <img src={p2.image} className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-slate-900">
                              {p2.isAi ? 'AI Model' : 'Human'}
                          </div>
                      </div>
                      
                      <h3 className="text-lg md:text-xl font-bold text-white mb-0.5">{p2.artistName}</h3>
                      <p className="text-slate-400 text-[10px] md:text-xs mb-3 md:mb-6 max-w-[80%] truncate">{p2.trackTitle}</p>

                      <div className="flex gap-3 md:gap-4">
                          <button 
                              onClick={() => handlePlay(p2)}
                              disabled={!p2.audioUrl}
                              className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-xl ${isPlaying === p2.id ? 'bg-purple-500 text-white' : 'bg-white text-slate-950 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                          >
                              {isPlaying === p2.id ? <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <Play className="w-5 h-5 md:w-6 md:h-6 ml-1 fill-current" />}
                          </button>

                          <button 
                              onClick={() => handleVote(p2.id)}
                              disabled={!!userVote || !p2.audioUrl || isEnded}
                              className={`px-4 md:px-6 rounded-full font-bold text-xs md:text-sm flex items-center justify-center gap-1.5 md:gap-2 transition-all ${
                                  isEnded 
                                    ? winnerId === p2.id 
                                        ? 'bg-yellow-500 text-black ring-4 ring-yellow-500/20 opacity-100' 
                                        : 'bg-slate-800 text-slate-500 opacity-50 cursor-not-allowed'
                                    : userVote === p2.id 
                                        ? 'bg-green-500 text-white ring-4 ring-green-500/20' 
                                        : userVote 
                                            ? 'bg-slate-800 text-slate-500 opacity-50'
                                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                              }`}
                          >
                              {isEnded 
                                ? (winnerId === p2.id ? <><Award className="w-4 h-4" /> Winner</> : 'Defeated')
                                : (userVote === p2.id ? 'Voted' : <><Flame className="w-3 h-3 md:w-4 md:h-4" /> Vote</>)
                              }
                          </button>
                      </div>
                  </div>
              </div>
          </div>

          {/* LOWER SECTION: TABS */}
          <div className="flex-1 bg-slate-900 border-t border-slate-800 flex flex-col overflow-hidden">
              
              {/* Tab Navigation */}
              <div className="flex border-b border-slate-800 bg-slate-950/50">
                  <button 
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'chat' ? 'border-cyan-500 text-cyan-400 bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                      <MessageSquare className="w-3 h-3 md:w-4 md:h-4" /> Chat
                  </button>
                  <button 
                    onClick={() => setActiveTab('info')}
                    className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'info' ? 'border-cyan-500 text-cyan-400 bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                      <Info className="w-3 h-3 md:w-4 md:h-4" /> Rules
                  </button>
                  <button 
                    onClick={() => setActiveTab('stats')}
                    className={`flex-1 py-3 text-xs md:text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === 'stats' ? 'border-cyan-500 text-cyan-400 bg-slate-800/50' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                  >
                      <BarChart2 className="w-3 h-3 md:w-4 md:h-4" /> Stats
                  </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden relative">
                  
                  {/* CHAT TAB */}
                  {activeTab === 'chat' && (
                      <div className="absolute inset-0 flex flex-col">
                          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                              {chatMessages.map((msg) => (
                                  <div key={msg.id} className={`flex flex-col ${msg.user === 'You' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                                      <div className="flex items-end gap-2 max-w-[90%] md:max-w-[80%]">
                                          {msg.isSystem && msg.user !== 'You' && <Bot className="w-5 h-5 md:w-6 md:h-6 text-cyan-500 p-1 bg-slate-800 rounded-full" />}
                                          <div className={`px-3 py-2 rounded-2xl text-xs ${
                                              msg.isSystem ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                                              msg.user === 'You' ? 'bg-cyan-600 text-white' : 'bg-slate-700 text-slate-200'
                                          }`}>
                                              {!msg.isSystem && <span className="block text-[10px] font-bold opacity-70 mb-0.5">{msg.user}</span>}
                                              {msg.text}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          
                          {/* AI Ticker Integrated above Input */}
                          <div className="bg-slate-950/80 backdrop-blur border-t border-slate-800 p-2 text-center text-[10px] text-cyan-400 font-mono overflow-hidden whitespace-nowrap">
                              <span className="inline-block animate-pulse">● AI Commentary:</span> {tickerComment}
                          </div>

                          <form onSubmit={handleSendMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
                              <input 
                                  type="text" 
                                  value={chatInput}
                                  onChange={(e) => setChatInput(e.target.value)}
                                  placeholder="Say something..."
                                  disabled={isEnded}
                                  className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              />
                              <button type="submit" disabled={isEnded} className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full transition-colors disabled:opacity-50">
                                  <Send className="w-4 h-4" />
                              </button>
                          </form>
                      </div>
                  )}

                  {/* INFO TAB (Updated with Config Rules) */}
                  {activeTab === 'info' && (
                      <div className="absolute inset-0 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                              <div>
                                  <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                      <Gavel className="w-4 h-4 text-purple-500" /> Battle Rules
                                  </h3>
                                  <ul className="space-y-3">
                                      <li className="flex items-start gap-3 text-xs md:text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></div>
                                          <span className="text-white font-bold mr-1">Format:</span> {activeBattle.config.format}
                                      </li>
                                      <li className="flex items-start gap-3 text-xs md:text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                                          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></div>
                                          <span className="text-white font-bold mr-1">Max Duration:</span> {activeBattle.config.maxDurationSeconds}s
                                      </li>
                                      {activeBattle.config.customRules.map((rule, idx) => (
                                          <li key={idx} className="flex items-start gap-3 text-xs md:text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                                              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></div>
                                              {rule}
                                          </li>
                                      ))}
                                  </ul>
                                  
                                  <div className="mt-6 flex gap-4">
                                      <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 p-4 rounded-xl flex-1 text-center">
                                          <Award className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                                          <div className="text-xl md:text-2xl font-bold text-white">{activeBattle.config.rewards.xp}</div>
                                          <div className="text-[10px] uppercase text-yellow-500 font-bold">XP Reward</div>
                                      </div>
                                      {activeBattle.config.rewards.cash && (
                                          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 p-4 rounded-xl flex-1 text-center">
                                              <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                              <div className="text-xl md:text-2xl font-bold text-white">${activeBattle.config.rewards.cash}</div>
                                              <div className="text-[10px] uppercase text-green-500 font-bold">Cash Prize</div>
                                          </div>
                                      )}
                                  </div>
                              </div>
                              <div>
                                  <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                      <User className="w-4 h-4 text-cyan-500" /> Artist Profiles
                                  </h3>
                                  <div className="space-y-4">
                                      {activeBattle.participants.map(p => (
                                          <div key={p.id} className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-lg border border-slate-800">
                                              <img src={p.image} className="w-12 h-12 rounded-full object-cover border-2 border-slate-700" />
                                              <div>
                                                  <div className="font-bold text-white flex items-center gap-2 text-sm">
                                                      {p.artistName}
                                                      {p.isAi && <span className="text-[10px] bg-cyan-900/50 text-cyan-400 px-1.5 rounded border border-cyan-500/20">AI</span>}
                                                  </div>
                                                  <div className="text-xs text-slate-500">Track: {p.trackTitle}</div>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}

                  {/* STATS TAB */}
                  {activeTab === 'stats' && (
                      <div className="absolute inset-0 overflow-y-auto p-6 custom-scrollbar flex flex-col justify-center">
                          <div className="max-w-3xl mx-auto w-full space-y-8">
                              
                              {/* Vote Bar */}
                              <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-800">
                                  <div className="flex justify-between text-sm font-bold text-white mb-2">
                                      <span>{p1.artistName} ({p1Percent}%)</span>
                                      <span>{p2.artistName} ({p2Percent}%)</span>
                                  </div>
                                  <div className="h-6 w-full bg-slate-700 rounded-full overflow-hidden flex relative">
                                      <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${p1Percent}%` }}></div>
                                      <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${p2Percent}%` }}></div>
                                      
                                      {/* Center Line */}
                                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 -translate-x-1/2"></div>
                                  </div>
                                  <div className="flex justify-between text-xs text-slate-500 mt-2">
                                      <span>{p1Votes} Votes</span>
                                      <span>{p2Votes} Votes</span>
                                  </div>
                              </div>

                              {/* Engagement Cards */}
                              <div className="grid grid-cols-3 gap-2 md:gap-4">
                                  <div className="bg-slate-800/50 p-3 md:p-4 rounded-xl border border-slate-800 text-center">
                                      <Users className="w-5 h-5 md:w-6 md:h-6 text-cyan-400 mx-auto mb-2" />
                                      <div className="text-lg md:text-2xl font-bold text-white">{activeBattle.listeners}</div>
                                      <div className="text-[10px] md:text-xs text-slate-500">Live Listeners</div>
                                  </div>
                                  <div className="bg-slate-800/50 p-3 md:p-4 rounded-xl border border-slate-800 text-center">
                                      <ThumbsUp className="w-5 h-5 md:w-6 md:h-6 text-green-400 mx-auto mb-2" />
                                      <div className="text-lg md:text-2xl font-bold text-white">92%</div>
                                      <div className="text-[10px] md:text-xs text-slate-500">Engagement Rate</div>
                                  </div>
                                  <div className="bg-slate-800/50 p-3 md:p-4 rounded-xl border border-slate-800 text-center">
                                      <Music className="w-5 h-5 md:w-6 md:h-6 text-purple-400 mx-auto mb-2" />
                                      <div className="text-lg md:text-2xl font-bold text-white truncate px-1">{activeBattle.genre}</div>
                                      <div className="text-[10px] md:text-xs text-slate-500">Top Genre</div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      </div>
  );
};
