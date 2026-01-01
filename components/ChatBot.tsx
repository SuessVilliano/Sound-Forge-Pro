
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
    { role: 'model', text: "Hello! I'm your AI Manager. I can help you find opportunities, analyze your stats, or draft pitch emails. What's on your mind?" }
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
  // Semantic change: store Right/Bottom instead of Left/Top to ensure upward expansion works naturally
  const { queue } = usePlayer();
  const [position, setPosition] = useState<{right: number, bottom: number} | null>(null);
  const [hasMoved, setHasMoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ right: 0, bottom: 0 });

  // Initial Position Logic
  useEffect(() => {
      // Set initial position only once to bottom right
      if (position === null) {
          const padding = 24;
          const playerHeight = queue.length > 0 ? 112 : 0; 
          
          // Position relative to bottom-right corner
          setPosition({ right: padding, bottom: padding + playerHeight });
      }
  }, [queue.length, position]);

  const handleMouseDown = (e: React.MouseEvent) => {
      // Prevent drag if interacting with internal controls
      if (isOpen && ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input'))) return;
      
      setIsDragging(true);
      setHasMoved(false); 
      
      dragStart.current = { x: e.clientX, y: e.clientY };
      posStart.current = { right: position?.right || 0, bottom: position?.bottom || 0 };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
      // Moving mouse RIGHT (increasing x) decreases RIGHT offset
      const dx = dragStart.current.x - e.clientX; 
      // Moving mouse DOWN (increasing y) decreases BOTTOM offset
      const dy = dragStart.current.y - e.clientY; 
      
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          setHasMoved(true);
      }

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
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = false;
          recognitionRef.current.interimResults = true;
          recognitionRef.current.lang = 'en-US';

          recognitionRef.current.onstart = () => setIsListening(true);
          recognitionRef.current.onend = () => {
              setIsListening(false);
          };

          recognitionRef.current.onresult = (event: any) => {
              const transcript = Array.from(event.results)
                  .map((result: any) => result[0])
                  .map((result) => result.transcript)
                  .join('');
              
              setInput(transcript);
              
              if (event.results[0].isFinal) {
                  handleSend(transcript);
              }
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

      const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/#/g, '')
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') 
        .replace(/https?:\/\/\S+/g, 'link'); 

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.1; 
      utterance.pitch = 1;
      
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Samantha')) && v.lang.includes('en')) || voices.find(v => v.lang === 'en-US');
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
  };

  const toggleVoiceListener = () => {
      if (isListening) {
          recognitionRef.current?.stop();
      } else {
          synthRef.current.cancel();
          setIsSpeaking(false);
          setInput('');
          try {
            recognitionRef.current?.start();
          } catch (e) {
            console.error("Mic error", e);
          }
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
      const context: ChatContext = {
          currentView,
          stats,
          opportunities
      };
      
      const delay = Math.random() * 1500 + 1500;
      await new Promise(r => setTimeout(r, delay));

      const response = await chatWithGemini(textToSend, newHistory, context);
      
      setMessages(prev => [...prev, { role: 'model', text: response }]);
      
      if (voiceEnabled) {
          speakText(response);
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting to the network right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!position) return null;

  return (
    <div 
        className="fixed z-[80] font-sans flex flex-col items-end"
        style={{ right: position.right, bottom: position.bottom }}
    >
      {isOpen ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl w-80 sm:w-96 h-[600px] max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in duration-200 ring-1 ring-slate-900/5">
          {/* Header - Draggable Area */}
          <div 
            className="bg-slate-50/90 dark:bg-slate-800/90 backdrop-blur p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700 cursor-move select-none"
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 relative">
                <Bot className="w-6 h-6 text-white" />
                {isSpeaking && (
                    <span className="absolute -right-1 -bottom-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                    </span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">SoundForge AI</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`relative flex h-2 w-2`}>
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isListening ? 'bg-red-400' : 'bg-green-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isListening ? 'bg-red-500' : 'bg-green-500'}`}></span>
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Online'}
                    </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
                <div className="p-2 text-slate-400 cursor-move hidden sm:block" title="Drag to move">
                    <Move className="w-4 h-4" />
                </div>
                <button 
                    onClick={() => {
                        setVoiceEnabled(!voiceEnabled);
                        if(voiceEnabled) synthRef.current.cancel();
                    }}
                    className={`p-2 rounded-full transition-colors ${voiceEnabled ? 'text-cyan-500 bg-cyan-500/10' : 'text-slate-400 hover:text-slate-500 dark:hover:text-slate-300'}`}
                    title={voiceEnabled ? "Mute Voice Output" : "Enable Voice Output"}
                >
                    {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-cyan-600 text-white rounded-tr-sm' 
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700'
                }`}>
                  <ReactMarkdown 
                    components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        a: ({node, ...props}) => <a className="text-cyan-300 hover:underline break-all" target="_blank" rel="noopener noreferrer" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        strong: ({node, ...props}) => <span className="font-bold text-cyan-600 dark:text-cyan-400" {...props} />,
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold mb-1" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-slate-300 pl-3 italic my-2" {...props} />,
                        code: ({node, ...props}) => <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded text-xs font-mono" {...props} />
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start animate-in fade-in">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative">
            {isListening && (
                <div className="absolute -top-12 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-red-500/90 backdrop-blur text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg animate-bounce flex items-center gap-2">
                        <Mic className="w-3 h-3" /> Listening...
                    </div>
                </div>
            )}
            
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleVoiceListener}
                className={`p-3 rounded-full transition-all shadow-md shrink-0 ${
                    isListening 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-cyan-500 dark:hover:text-cyan-400'
                }`}
                title="Speak to AI"
              >
                  {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <div className="flex-1 relative">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={isListening ? "Listening..." : "Ask anything..."}
                    className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-full py-3.5 pl-5 pr-12 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-500 dark:placeholder:text-slate-600 shadow-inner"
                  />
                  <button 
                    onClick={() => handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                  >
                    <Send className="w-4 h-4" />
                  </button>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-600 text-center mt-2 flex items-center justify-center gap-1">
                Powered by Gemini <Sparkles className="w-2 h-2 text-yellow-500" /> 2.5
            </div>
          </div>
        </div>
      ) : (
        <button 
          onMouseDown={handleMouseDown}
          onClick={(e) => {
              if (!hasMoved && !isDragging) {
                  setIsOpen(true);
              }
          }}
          className={`group flex items-center gap-3 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white p-4 pr-6 rounded-full shadow-2xl shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 ring-4 ring-white dark:ring-slate-900 cursor-move ${isDragging ? 'cursor-grabbing scale-105' : ''}`}
        >
          <div className="relative pointer-events-none">
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-cyan-600"></span>
          </div>
          <span className="font-bold text-sm hidden sm:inline pointer-events-none">Ask AI Assistant</span>
        </button>
      )}
    </div>
  );
};
