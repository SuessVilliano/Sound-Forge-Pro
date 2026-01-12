
import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, AlertCircle, Loader2, Sparkles, Shield, Rocket } from 'lucide-react';
import { authService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSimulation, setIsSimulation] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleGuestFallback = async () => {
      setLoading(true);
      setIsSimulation(true);
      try {
          await authService.loginAsGuest();
          // Short delay for user to see the "Sandbox" status before modal closes
          setTimeout(() => onClose(), 1000);
      } catch (e) {
          setError("Unable to start sandbox session.");
          setIsSimulation(false);
          setLoading(false);
      }
  };

  const handleDemoLogin = async () => {
      setLoading(true);
      try {
          await authService.loginAsDemo();
          onClose();
      } catch (e) {
          setError("Demo node activation failed.");
          setLoading(false);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const cleanEmail = email.trim();
      if (!cleanEmail || !password) throw new Error("Credentials are required");

      let user;
      if (mode === 'signup') {
        if (!name) throw new Error("Name is required");
        user = await authService.registerWithEmail(name, cleanEmail, password);
      } else {
        user = await authService.loginWithEmail(cleanEmail, password);
      }

      // Check if we entered Simulation Mode automatically
      if (user.uid.startsWith('mock_')) {
          setIsSimulation(true);
          setTimeout(() => onClose(), 1000);
      } else {
          onClose();
      }
    } catch (err: any) {
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed' || err.message?.includes('configuration')) {
          console.warn("Backend restricted. Initializing Sandbox...");
          await handleGuestFallback();
          return;
      }

      setLoading(false);
      if (err.code === 'auth/invalid-email') setError("Invalid email format.");
      else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') setError("Invalid credentials.");
      else if (err.code === 'auth/email-already-in-use') setError("Email already registered.");
      else setError(err.message || "Auth failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div>
            <h2 className="text-xl font-bold text-white">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            <p className="text-slate-400 text-sm mt-1">{mode === 'login' ? 'Enter your details to access your studio.' : 'Join SoundForge Pro to start your career.'}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          
          {isSimulation ? (
              <div className="py-8 text-center animate-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                      <Sparkles className="w-8 h-8 text-cyan-400 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Sandbox Active</h3>
                  <p className="text-slate-400 text-sm max-w-xs mx-auto">
                      Firebase restricted in this environment. We've created a sandbox artist profile for you.
                  </p>
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-cyan-500 font-bold">
                      <Loader2 className="w-3 h-3 animate-spin" /> Entering Studio...
                  </div>
              </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3 text-red-400 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Stage Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Rivera"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Email or Username</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com or 'admin'"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 ml-1 uppercase">Secure Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-slate-700 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button 
                  type="submit" disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 mt-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5" /></>}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-slate-900 px-3 text-slate-500">Master Access</span></div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={handleDemoLogin}
                  className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-xl shadow-indigo-600/20"
                >
                  <Rocket className="w-4 h-4" /> Launch Legendary Pro Demo
                </button>
                <div className="grid grid-cols-2 gap-3">
                    <button 
                    onClick={() => authService.loginWithGoogle().then(() => onClose())}
                    className="flex items-center justify-center gap-2 bg-white text-slate-900 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors"
                    >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" className="w-4 h-4" /> Google
                    </button>
                    <button 
                    onClick={handleGuestFallback}
                    className="flex items-center justify-center gap-2 bg-slate-800 text-slate-300 border border-slate-700 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-700 hover:text-white transition-colors"
                    >
                    <Shield className="w-4 h-4" /> Sandbox
                    </button>
                </div>
              </div>

              <div className="mt-8 text-center text-sm text-slate-500">
                {mode === 'login' ? "New here? " : "Joined already? "}
                <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-cyan-400 hover:underline font-bold">
                  {mode === 'login' ? 'Join the Forge' : 'Log In'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
