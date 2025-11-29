
import React, { useState, useRef, useEffect } from 'react';
import { ScrollText, CheckCircle2, PenTool, AlertCircle, FileText, X } from 'lucide-react';

interface LegalOnboardingProps {
  isOpen: boolean;
  onSign: () => void;
}

export const LegalOnboarding: React.FC<LegalOnboardingProps> = ({ isOpen, onSign }) => {
  const [canSign, setCanSign] = useState(false);
  const [signature, setSignature] = useState('');
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      if (scrollHeight - scrollTop <= clientHeight + 10) {
        setScrolledToBottom(true);
      }
    }
  };

  const handleSign = () => {
    if (signature.trim().length > 2 && scrolledToBottom) {
        onSign();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <ScrollText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Service Agreement & Voice IP License</h2>
                    <p className="text-sm text-slate-500">Please read and sign to continue.</p>
                </div>
            </div>
            <div className="text-xs font-mono text-slate-400">
                Doc ID: LIV8AI-NDA-2025-v1.0
            </div>
        </div>

        {/* Contract Content */}
        <div 
            ref={contentRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-900/50 font-serif text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-6 shadow-inner"
        >
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h1 className="text-2xl font-bold text-center mb-8 uppercase border-b border-slate-300 dark:border-slate-600 pb-4">Joint Non-Disclosure Agreement & Voice Copyright / AI Cloning License Agreement</h1>
                
                <p className="font-bold mb-4">Version 1.0 – Effective Date: {new Date().toLocaleDateString()}</p>
                
                <h3 className="font-bold text-lg mt-6 mb-2">1. INTRODUCTION & PARTIES</h3>
                <p>This Joint Non-Disclosure Agreement and Voice Copyright / AI Cloning Licensing Agreement ("Agreement") is entered into by and between LIV8AI, Inc. (hereinafter "Company") and the Artist (hereinafter "Artist" or "Receiving Party").</p>
                
                <h3 className="font-bold text-lg mt-6 mb-2">2. PURPOSE OF AGREEMENT</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Non-disclosure of Confidential Information</li>
                    <li>Ownership of vocal identity and voice IP</li>
                    <li>Licensing of AI-generated vocal models</li>
                    <li>Protection from unauthorized voice cloning</li>
                </ul>

                <h3 className="font-bold text-lg mt-6 mb-2">3. ARTIST VOICE INTELLECTUAL PROPERTY ("Voice IP")</h3>
                <p>The Artist retains 100% ownership of their Voice IP, including natural voice, singing voice, and any AI-generated voice models derived from their data.</p>

                <h3 className="font-bold text-lg mt-6 mb-2">4. VOICE PROTECTION & PROHIBITED USES</h3>
                <p>LIV8AI agrees NOT to:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Train AI models on the Artist's voice without signed permission</li>
                    <li>Clone or replicate the Artist's voice without explicit consent</li>
                    <li>Sell, license, or distribute AI versions of the Artist's voice to third parties</li>
                </ul>

                <h3 className="font-bold text-lg mt-6 mb-2">5. OPTIONAL VOICE LICENSING</h3>
                <p>If the Artist chooses to license their voice, the terms must specify purpose, media formats, territory, duration, and payment structure.</p>

                <h3 className="font-bold text-lg mt-6 mb-2">6. DATA SECURITY</h3>
                <p>LIV8AI must encrypt all voice data using industry-standard security protocols and restrict employee access.</p>

                <h3 className="font-bold text-lg mt-6 mb-2">7. TERM & TERMINATION</h3>
                <p>This agreement lasts for five (5) years for general confidentiality and in perpetuity for Voice IP ownership. Either party may terminate with 30-day written notice.</p>
                
                <div className="my-8 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-center italic text-slate-500">
                    (Scroll to the bottom to enable signature)
                </div>

                <p className="mb-4">
                    By signing below, you acknowledge that you have read, understood, and agreed to be bound by the terms of this Agreement.
                    You verify that you are the authorized owner of the voice data being provided.
                </p>
                
                <p className="mt-12 mb-12 h-32"></p>
                <p className="text-center text-xs text-slate-400">End of Document</p>
            </div>
        </div>

        {/* Footer / Signature Area */}
        <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">Digital Signature</label>
                    <div className="relative">
                        <PenTool className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            value={signature}
                            onChange={(e) => setSignature(e.target.value)}
                            placeholder="Type your full legal name"
                            disabled={!scrolledToBottom}
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>
                    {!scrolledToBottom && (
                        <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Please scroll to the bottom of the contract to sign.
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                     <button 
                        onClick={handleSign}
                        disabled={!scrolledToBottom || signature.length < 3}
                        className="w-full md:w-auto px-8 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        I Agree & Sign
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
