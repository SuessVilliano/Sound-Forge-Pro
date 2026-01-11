

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Minimize2, Sparkles, Bot, Mic, MicOff, Volume2, VolumeX, StopCircle, Move, ChevronDown, CheckCheck, Users } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithGemini, ChatContext } from '../services/geminiService';
/* Added AiStaffMember to type imports */
import { Stats, Opportunity, AiStaffMember, DistributionSubmission } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { authService } from '../services/authService';

const STAFF: AiStaffMember[] = [
    { id: 'mgr', name: 'James', role: 'manager', avatar: 'https://ui-avatars.com/api/?name=James+Manager&background=020617&color=fff', online: true, description: 'Executive Strategy & Business Coordination', lastMessage: "Let's review your Q3 plan." },
    { id: 'mkt', name: 'Elena', role: 'marketing', avatar: 'https://ui-avatars.com/api/?name=Elena+Mkt&background=06b6d4&color=fff', online: true, description: 'Growth, Socials & Hype', lastMessage: "Your TikTok engagement is up 20%!" },
    { id: 'dst', name: 'Sarah', role: 'distribution', avatar: 'https://ui-avatars.com/api/?name=Sarah+Dist&background=10b981&color=fff', online: true, description: 'Store Submissions & Metadata', lastMessage: "New single is live on Apple Music." },
    { id: 'lgl', name: 'Marcus', role: 'legal', avatar: 'https://ui-avatars.com/api/?name=Marcus+Legal&background=f43f5e&color=fff', online: true, description: 'Voice IP & Rights Protection', lastMessage: "Secured your latest VoiceShield hash." },
];

interface ChatBotProps {
    currentView: string;
    stats: Stats;
    opportunities: Opportunity[];
    pendingDistributions?: DistributionSubmission[];
}

export const ChatBot: React.FC<ChatBotProps> = ({ currentView, stats, opportunities, pendingDistributions }) => {
  const user = authService.getCurrentUser();
  const [isOpen, setIsOpen] = useState(false);
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AiStaffMember>(STAFF[0]);
  
  const [threads, setThreads] = useState<Record<string, {role: 'user' | 'model', text: string}[]>>({
    mgr: [{ role: 'model', text: "Hello! I'm James, your Manager. Let's build your professional infrastructure today." }],
    mkt: [{ role: 'model', text: "Elena here! Ready to boost your social signals?" }],
    dst: [{ role: 'model', text: "I'm Sarah. I manage your distribution vault and metadata." }]
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { queue } = usePlayer();
  const [position, setPosition] = useState<{right: number, bottom: number} | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ right: 0, bottom: 0 });

  useEffect(() => {
      if (position === null) {
          const padding = 24;
          const playerHeight = queue.length > 0 ? 112 : 0; 
          setPosition({ right: padding, bottom: padding + playerHeight });
      }
  }, [queue.length, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
      if (isOpen && ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input'))) return;
      setIsDragging(true);
      setHasMoved(false); 
      dragStart.current = { x: e.clientX, y: e.clientY };
      posStart.current = { right: position?.right || 0, bottom: position?.bottom || 0 };
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
      const dx = dragStart.current.x - e.clientX; 
      const dy = dragStart.current.y - e.clientY; 
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) setHasMoved(true);
      setPosition({
          right: posStart.current.right + dx,
          bottom: posStart.current.bottom + dy
      });
  };

  const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [threads, selectedAgent.id, isOpen]);

  useEffect(() => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-US';
          recognitionRef.current.onstart = () => setIsListening(true);
          recognitionRef.current.onend = () => setIsListening(false);
          recognitionRef.current.onresult = (event: any) => {
              const transcript = Array.from(event.results)
                  .map((result: any) => result[0])
                  .map((result) => result.transcript)
                  .join('');
              setInput(transcript);
              if (event.results[0].isFinal) handleSend(transcript);
          };
      }
  }, []);

  useEffect(() => {
      if (!isOpen) {
          synthRef.current.cancel();
          setIsSpeaking(false);
      }
  }, [isOpen]);

  const speakText = (text: string) => {
      if (!voiceEnabled || !synthRef.current) return;
      synthRef.current.cancel();
      const cleanText = text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/#/g, '').replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1').replace(/https?:\/\/\S+/g, 'link'); 
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.1; 
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Samantha')) && v.lang.includes('en')) || voices.find(v => v.lang === 'en-US');
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synthRef.current.speak(utterance);
  };

  const toggleVoiceListener = () => {
      if (isListening) recognitionRef.current?.stop();
      else {
          synthRef.current.cancel();
          setIsSpeaking(false);
          setInput('');
          try { recognitionRef.current?.start(); } catch (e) { console.error(e); }
      }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isLoading) return;
    
    setInput('');
    const currentThread = threads[selectedAgent.id] || [];
    const newHistory = [...currentThread, { role: 'user' as const, text: textToSend }];
    
    setThreads(prev => ({ ...prev, [selectedAgent.id]: newHistory }));
    setIsLoading(true);
    
    try {
      const response = await chatWithGemini(textToSend, newHistory, { 
          currentView, 
          stats, 
          opportunities,
          user: user || undefined,
          agentRole: selectedAgent.role,
          pendingDistributions: pendingDistributions
      });
      
      setThreads(prev => ({ 
          ...prev, 
          [selectedAgent.id]: [...newHistory, { role: 'model', text: response }] 
      }));
      
      if (voiceEnabled) speakText(response);
    } catch (error) {
      setThreads(prev => ({ 
          ...prev, 
          [selectedAgent.id]: [...newHistory, { role: 'model', text: "Sorry, I'm having trouble connecting to the Sound Merge network." }] 
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const switchAgent = (agent: AiStaffMember) => {
      setSelectedAgent(agent);
      setShowStaffPicker(false);
      if (!threads[agent.id]) {
          setThreads(prev => ({
              ...prev,
              [agent.id]: [{ role: 'model', text: `Hi! I'm ${agent.name}, your ${agent.role}. How can I assist you in the ${currentView} today?` }]
          }));
      }
  };

  if (!position) return null;

  const currentMessages = threads[selectedAgent.id] || [];

  return (
    <div className="fixed z-[80] font-sans flex flex-col items-end" style={{ right: position.right, bottom: position.bottom }}>
      {isOpen ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 h-[600px] max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 cursor-move" onMouseDown={handleMouseDown}>
            <div className="flex items-center gap-3 relative">
              <button 
                onClick={() => setShowStaffPicker(!showStaffPicker)}
                className="relative group flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 p-1.5 rounded-xl transition-all"
              >
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-950 border-2 border-indigo-500 overflow-hidden shadow-lg">
                    <img src={selectedAgent.avatar} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1">
                        {selectedAgent.name} <ChevronDown className={`w-3 h-3 transition-transform ${showStaffPicker ? 'rotate-180' : ''}`} />
                    </h3>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                            {selectedAgent.role}
                        </span>
                    </div>
                  </div>

                  {showStaffPicker && (
                    <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-50 py-2 animate-in zoom-in-95 duration-200">
                        <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 mb-1">Select Staff Member</div>
                        {STAFF.map(agent => (
                            <button 
                                key={agent.id}
                                onClick={(e) => { e.stopPropagation(); switchAgent(agent); }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${selectedAgent.id === agent.id ? 'bg-indigo-500/10' : ''}`}
                            >
                                <img src={agent.avatar} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" />
                                <div className="text-left min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white uppercase">{agent.name}</p>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter truncate">{agent.role}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                  )}
              </button>
            </div>
            
            <div className="flex items-center gap-1">
                <button onClick={() => { setVoiceEnabled(!voiceEnabled); if(voiceEnabled) synthRef.current.cancel(); }} className={`p-2 rounded-full ${voiceEnabled ? 'text-cyan-500 bg-cyan-500/10' : 'text-slate-400'}`}>
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white"><Minimize2 className="w-5 h-5" /></button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50 custom-scrollbar">
            {currentMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700'}`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{selectedAgent.name} is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button onClick={toggleVoiceListener} className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <div className="flex-1 relative">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder={`Message ${selectedAgent.name}...`} className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-full py-3.5 pl-5 pr-12 text-sm text-slate-900 dark:text-white outline-none focus:border-indigo-500" />
                  <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-full disabled:opacity-50"><Send className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button onMouseDown={handleMouseDown} onClick={() => !hasMoved && !isDragging && setIsOpen(true)} className={`group flex items-center gap-3 bg-gradient-to-r from-indigo-600 to-indigo-900 text-white p-4 pr-6 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 ring-4 ring-white dark:ring-slate-900 ${isDragging ? 'cursor-grabbing scale-105' : ''}`}>
          <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden shrink-0 shadow-lg">
             <img src={selectedAgent.avatar} className="w-full h-full object-cover" />
          </div>
          <div className="text-left hidden sm:block">
              <span className="font-bold text-xs uppercase tracking-widest block leading-none">{selectedAgent.name}</span>
              <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em]">Active Agent</span>
          </div>
        </button>
      )}
    </div>
  );
};
