import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Volume2, AudioLines } from 'lucide-react';
import { LiveSession } from '../services/geminiService';

export const LiveAgent: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const sessionRef = useRef<LiveSession | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');

    const animate = () => {
        if (!canvas || !ctx) return;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        if (isConnected) {
            // Orb Animation
            const time = Date.now() / 1000;
            const baseRadius = 60;
            const pulse = isTalking ? Math.sin(time * 10) * 10 : Math.sin(time * 2) * 5;
            const radius = baseRadius + pulse;

            // Glow
            const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.5);
            gradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)'); // Cyan
            gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');

            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Core
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = '#06b6d4';
            ctx.fill();
            
            // Ripple
             if (isTalking) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius * 1.2, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

        } else {
             // Idle State
            ctx.beginPath();
            ctx.arc(centerX, centerY, 40, 0, Math.PI * 2);
            ctx.fillStyle = '#334155'; // Slate 700
            ctx.fill();
        }

        animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isConnected, isTalking]);

  const toggleConnection = async () => {
    if (isConnected) {
      sessionRef.current?.disconnect();
      setIsConnected(false);
      setIsTalking(false);
    } else {
      const session = new LiveSession();
      sessionRef.current = session;
      try {
          await session.connect();
          setIsConnected(true);
          // Mock talking state for visual feedback occasionally
          session.onAudioData = () => {
              setIsTalking(true);
              setTimeout(() => setIsTalking(false), 200);
          };
      } catch (error) {
          console.error("Failed to connect", error);
          alert("Could not connect to microphone or API.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute top-8 left-0 right-0 text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <AudioLines className="w-6 h-6 text-cyan-500" /> Live Agent
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                Have a real-time voice conversation with your AI manager.
            </p>
        </div>

        {/* Visualizer Canvas */}
        <div className="relative">
             <canvas ref={canvasRef} width={400} height={400} className="w-[300px] h-[300px] sm:w-[400px] sm:h-[400px]" />
             
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-12 flex flex-col items-center gap-4">
                 <div className="bg-slate-200 dark:bg-slate-800 px-4 py-2 rounded-full text-xs font-mono text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                     {isConnected ? "Listening..." : "Disconnected"}
                 </div>
                 
                 <button 
                    onClick={toggleConnection}
                    className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 ${
                        isConnected 
                        ? 'bg-red-500 text-white shadow-red-500/20 hover:bg-red-600' 
                        : 'bg-cyan-500 text-slate-950 shadow-cyan-500/20 hover:bg-cyan-400'
                    }`}
                 >
                     {isConnected ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                 </button>
             </div>
        </div>
        
        <div className="absolute bottom-8 text-xs text-slate-400 max-w-xs text-center">
            Powered by Gemini 2.5 Native Audio. <br/> Use headphones for the best experience.
        </div>
    </div>
  );
};