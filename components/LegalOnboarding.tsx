
import React, { useState, useRef, useEffect } from 'react';
import { ScrollText, CheckCircle2, PenTool, AlertCircle, X, ArrowDown, Loader2 } from 'lucide-react';

interface LegalOnboardingProps {
  isOpen: boolean;
  onSign: (signature: string) => Promise<void> | void;
  readOnly?: boolean;
  onClose?: () => void;
  signedDate?: string;
}

export const LegalOnboarding: React.FC<LegalOnboardingProps> = ({ isOpen, onSign, readOnly = false, onClose, signedDate }) => {
  const [signature, setSignature] = useState('');
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  useEffect(() => {
      isMounted.current = true;
      return () => { isMounted.current = false; };
  }, []);

  // Check if content fits screen on mount/resize
  useEffect(() => {
    if (isOpen) {
        // Reset state when reopening (unless readOnly)
        if (!readOnly) {
            setScrolledToBottom(false);
            setSignature('');
            setIsSubmitting(false);
        }
        
        // Small timeout to allow render and ref population
        const timer = setTimeout(() => {
            if (contentRef.current) {
                const { scrollHeight, clientHeight } = contentRef.current;
                // If content is shorter than container (or just barely larger), allow signing
                // Buffer of 50px is generous for different screen densities
                if (scrollHeight <= clientHeight + 50) {
                    setScrolledToBottom(true);
                }
            }
        }, 100);
        return () => clearTimeout(timer);
    }
  }, [isOpen, readOnly]);

  const handleScroll = () => {
    if (contentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      // Forgiving check: within 100px of bottom
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        setScrolledToBottom(true);
      }
    }
  };

  const handleSignClick = async () => {
    if (signature.trim().length > 2 && scrolledToBottom) {
        setIsSubmitting(true);
        try {
            await onSign(signature);
            // Typically parent unmounts us here.
            // If parent logic is optimistic, this component disappears immediately.
        } catch (e) {
            console.error("Sign error:", e);
            if (isMounted.current) {
                setIsSubmitting(false);
                alert("There was an issue signing the document. Please try again.");
            }
        }
    }
  };

  const scrollToBottomAction = () => {
      if (contentRef.current) {
          contentRef.current.scrollTo({
              top: contentRef.current.scrollHeight,
              behavior: 'smooth'
          });
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <ScrollText className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {readOnly ? 'Executed Service Agreement' : 'Service Agreement & Voice IP License'}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {readOnly && signedDate 
                            ? `Signed on ${new Date(signedDate).toLocaleDateString()}` 
                            : 'Please read the entire document to sign.'}
                    </p>
                </div>
            </div>
            {readOnly && onClose && (
                <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X className="w-5 h-5 text-slate-500" />
                </button>
            )}
            {!readOnly && (
                <div className="text-xs font-mono text-slate-400 hidden sm:block">
                    Doc ID: LIV8AI-NDA-2025-v1.0
                </div>
            )}
        </div>

        {/* Contract Content */}
        <div 
            ref={contentRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-8 bg-slate-100 dark:bg-slate-900/50 font-serif text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-6 shadow-inner relative"
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
                
                {!readOnly && !scrolledToBottom && (
                    <div className="my-8 p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded text-center text-yellow-600 dark:text-yellow-400 flex flex-col items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>Please scroll to the bottom to acknowledge all terms.</span>
                        <button onClick={scrollToBottomAction} className="text-xs font-bold underline hover:text-yellow-500">Jump to Bottom</button>
                    </div>
                )}

                <p className="mb-4">
                    By signing below, you acknowledge that you have read, understood, and agreed to be bound by the terms of this Agreement.
                    You verify that you are the authorized owner of the voice data being provided.
                </p>
                
                <p className="mt-12 mb-12 h-32"></p>
                <p className="text-center text-xs text-slate-400">End of Document</p>
            </div>
        </div>

        {/* Footer / Signature Area */}
        <div className="p-6 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0">
            {readOnly ? (
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-bold text-sm">Agreement Signed & Verified</span>
                    </div>
                    {onClose && (
                        <button 
                            onClick={onClose}
                            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors text-sm"
                        >
                            Close Viewer
                        </button>
                    )}
                </div>
            ) : (
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase">
                            Digital Signature {signature.length > 2 && <span className="text-green-500 ml-1">✓</span>}
                        </label>
                        <div className="relative">
                            <PenTool className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                value={signature}
                                onChange={(e) => setSignature(e.target.value)}
                                placeholder="Type your full legal name"
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg py-3 pl-10 pr-4 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                            />
                        </div>
                        {!scrolledToBottom && (
                            <p className="text-xs text-orange-500 mt-2 flex items-center gap-1 animate-pulse">
                                <ArrowDown className="w-3 h-3" /> Scroll to the end of the document to enable signing.
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                         <button 
                            onClick={handleSignClick}
                            disabled={!scrolledToBottom || signature.length < 3 || isSubmitting}
                            className="w-full md:w-auto px-8 py-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 min-w-[160px]"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Signing...</>
                            ) : (
                                <><CheckCircle2 className="w-4 h-4" /> I Agree & Sign</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
