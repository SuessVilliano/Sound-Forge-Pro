import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Minimize2, Sparkles, Bot, Mic, MicOff, Volume2, VolumeX, StopCircle, Move } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithGemini, ChatContext } from '../services/geminiService';
import { Stats, Opportunity } from '../types';
import { usePlayer } from '../contexts/PlayerContext';

interface ChatBotProps {
    currentView: string;
    stats: Stats;
    opportunities: Opportunity[];
}

export const ChatBot: React.FC<ChatBotProps> = ({ currentView, stats, opportunities }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "Hello! I'm your AI Manager at Sound Merge. I can help you find opportunities, analyze your stats, or manage your digital rights. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Position & Drag State
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
  }, [messages, isOpen]);

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
    const newHistory = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newHistory);
    setIsLoading(true);
    try {
      const response = await chatWithGemini(textToSend, newHistory, { currentView, stats, opportunities });
      setMessages(prev => [...prev, { role: 'model', text: response }]);
      if (voiceEnabled) speakText(response);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to the Sound Merge network." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!position) return null;

  return (
    <div className="fixed z-[80] font-sans flex flex-col items-end" style={{ right: position.right, bottom: position.bottom }}>
      {isOpen ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 h-[600px] max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
          <div className="bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 cursor-move" onMouseDown={handleMouseDown}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg relative">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">Sound Merge AI</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
                    </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
                <button onClick={() => { setVoiceEnabled(!voiceEnabled); if(voiceEnabled) synthRef.current.cancel(); }} className={`p-2 rounded-full ${voiceEnabled ? 'text-cyan-500 bg-cyan-500/10' : 'text-slate-400'}`}>
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 text-slate-500 hover:text-white"><Minimize2 className="w-5 h-5" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700'}`}>
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                  <span className="text-xs text-slate-500">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button onClick={toggleVoiceListener} className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              <div className="flex-1 relative">
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask Sound Merge..." className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-full py-3.5 pl-5 pr-12 text-sm text-slate-900 dark:text-white outline-none focus:border-cyan-500" />
                  <button onClick={() => handleSend()} disabled={!input.trim() || isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 text-slate-950 rounded-full disabled:opacity-50"><Send className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <button onMouseDown={handleMouseDown} onClick={() => !hasMoved && !isDragging && setIsOpen(true)} className={`group flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white p-4 pr-6 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 ring-4 ring-white dark:ring-slate-900 ${isDragging ? 'cursor-grabbing scale-105' : ''}`}>
          <MessageSquare className="w-6 h-6" />
          <span className="font-bold text-sm hidden sm:inline">Ask Sound Merge</span>
        </button>
      )}
    </div>
  );
};