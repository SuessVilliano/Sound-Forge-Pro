
import React, { useState, useRef } from 'react';
import { Sparkles, MessageSquare, Target, Heart, Image as ImageIcon, Wand2, Download, Upload, Layers, Video, Play, Music, Scan, Eraser, Palette, Camera, Sun, Brush, X, Sliders, RotateCcw, Clapperboard } from 'lucide-react';
import { generateBrandImage, editBrandImage, generateVideoFromImage, analyzeImage, generateVideoFromText } from '../services/geminiService';

type Tab = 'strategy' | 'visuals';
type VisualMode = 'create' | 'enhance' | 'animate';
type ImageSize = '1K' | '2K' | '4K';
type AssetType = 'image' | 'video';
type AspectRatio = '1:1' | '16:9' | '9:16' | '3:4';

const ART_STYLES = ['Photorealistic', 'Cyberpunk', 'Anime', 'Oil Painting', 'Watercolor', 'Cinematic', 'Minimalist', 'Retro', '3D Render', 'Surrealism'];
const CAMERA_ANGLES = ['Eye Level', 'Low Angle', 'High Angle', 'Aerial View', 'Close Up', 'Wide Angle', 'Macro', 'Fisheye'];
const LIGHTING_OPTS = ['Natural Daylight', 'Studio Lighting', 'Neon Lights', 'Golden Hour', 'Dramatic Shadows', 'Soft Box', 'Cyberpunk Glow', 'Volumetric Lighting'];
const MOTION_STYLES = [
    { value: 'Cinematic Pan', label: 'Cinematic Slow Pan' },
    { value: 'Cyberpunk Glitch', label: 'Techno/Glitch Pulse' },
    { value: 'Zoom In', label: 'Dramatic Zoom In' },
    { value: 'Orbit', label: 'Orbit Around Subject' },
    { value: 'Natural Handheld', label: 'Natural Handheld' },
    { value: 'Neon Pulse', label: 'Neon Light Pulse' }
];
const PROMO_VIBES = [
    'High Energy / Hype',
    'Chill / Lo-Fi',
    'Dark / Industrial',
    'Dreamy / Ethereal',
    'Psychedelic / Trippy',
    'Aggressive / Mosh',
    'Romantic / Soft',
    'Minimal / Clean'
];

export const BrandBuilder: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('strategy');
  
  // Visuals State
  const [visualMode, setVisualMode] = useState<VisualMode>('create');
  const [assetType, setAssetType] = useState<AssetType>('image'); // New State for Video Generation
  const [imgPrompt, setImgPrompt] = useState('');
  const [imgSize, setImgSize] = useState<ImageSize>('1K');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [motionStyle, setMotionStyle] = useState('Cinematic Pan');
  const [promoVibe, setPromoVibe] = useState('High Energy / Hype');
  
  // Granular Generation Controls
  const [artStyle, setArtStyle] = useState('');
  const [camera, setCamera] = useState('');
  const [light, setLight] = useState('');
  
  // Image Adjustments
  const [adjustments, setAdjustments] = useState({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      hue: 0
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  // Analysis State
  const [detectedObjects, setDetectedObjects] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Strategy State
  const [strategyGenerated, setStrategyGenerated] = useState(false);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  const handleGeneration = async () => {
    if (!imgPrompt && visualMode === 'create') return;
    if (!uploadedImage && (visualMode === 'enhance' || visualMode === 'animate')) return;

    /* Check for API Key Selection for Veo or High Quality Images (Gemini 3 Pro Image) */
    if ((visualMode === 'animate' || (visualMode === 'create' && (assetType === 'video' || imgSize === '2K' || imgSize === '4K'))) && (window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        if (!hasKey) {
            /* Trigger select key dialog and assume success to mitigate race condition */
            (window as any).aistudio.openSelectKey();
        }
    }

    setIsGenerating(true);
    setGeneratedImage(null);
    setGeneratedVideo(null);
    
    try {
      if (visualMode === 'create') {
        if (assetType === 'video') {
            // Text to Video (Veo)
            let enrichedPrompt = imgPrompt;
            if (artStyle) enrichedPrompt += `, ${artStyle} style`;
            if (camera) enrichedPrompt += `, ${camera} shot`;
            if (light) enrichedPrompt += `, ${light} lighting`;
            
            // For video, we might want to enforce 16:9 or 9:16
            const videoRatio = (aspectRatio === '16:9' || aspectRatio === '9:16') ? aspectRatio : '16:9';
            
            const result = await generateVideoFromText(enrichedPrompt, videoRatio);
            if (result) setGeneratedVideo(result);

        } else {
            // Text to Image (Imagen/Gemini)
            let enrichedPrompt = imgPrompt;
            const enhancements = [];
            if (artStyle) enhancements.push(`${artStyle} style`);
            if (camera) enhancements.push(`${camera} shot`);
            if (light) enhancements.push(`${light} lighting`);
            
            if (enhancements.length > 0) {
                enrichedPrompt += `. (${enhancements.join(', ')})`;
            }

            const result = await generateBrandImage(enrichedPrompt, imgSize, aspectRatio);
            if (result) setGeneratedImage(result);
        }
      } else if (visualMode === 'enhance' && uploadedImage) {
        const result = await editBrandImage(uploadedImage, imgPrompt, imgSize);
        if (result) setGeneratedImage(result);
      } else if (visualMode === 'animate' && uploadedImage) {
        // Image to Video (Veo)
        // Force 16:9 or 9:16 for video if not set correctly, defaulting to 16:9
        const videoRatio = (aspectRatio === '16:9' || aspectRatio === '9:16') ? aspectRatio : '16:9';
        
        // Construct a music-promo optimized prompt
        const fullPrompt = `Music video promo, ${promoVibe} vibe. ${imgPrompt}. Motion: ${motionStyle}. Cinematic lighting, high resolution, trending on social media.`;
        
        const result = await generateVideoFromImage(uploadedImage, fullPrompt, videoRatio);
        if (result) setGeneratedVideo(result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return;
    setIsAnalyzing(true);
    setDetectedObjects([]);
    try {
        const objects = await analyzeImage(uploadedImage);
        setDetectedObjects(objects);
    } catch(e) {
        console.error(e);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const applyStyle = (style: string) => {
      if (!style) return;
      setImgPrompt(`Transform this image into a ${style} style.`);
  };

  const triggerRemoveBg = () => {
      setImgPrompt("Isolate the main subject on a pure white background.");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setDetectedObjects([]); // Reset detection on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAdjustments = () => {
      setAdjustments({ brightness: 100, contrast: 100, saturation: 100, hue: 0 });
  };

  const handleGenerateStrategy = () => {
    setIsGeneratingStrategy(true);
    // Simulate AI delay
    setTimeout(() => {
        setStrategyGenerated(true);
        setIsGeneratingStrategy(false);
    }, 2000);
  };

  const activeImage = generatedImage || uploadedImage;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-2xl font-bold text-white">AI Brand Builder</h1>
            <p className="text-slate-400 text-sm mt-1">Create a comprehensive brand strategy and professional visual assets.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="bg-slate-800 p-1 rounded-lg flex gap-1">
            <button 
                onClick={() => setActiveTab('strategy')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'strategy' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
                Brand Strategy
            </button>
            <button 
                onClick={() => setActiveTab('visuals')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'visuals' ? 'bg-cyan-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
                Visual Studio
            </button>
        </div>
      </div>

      {activeTab === 'strategy' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
            <div className="bg-slate-850 rounded-xl border border-slate-800 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-green-400" />
                    <h3 className="text-xl font-bold text-white">Generate Your Brand Strategy</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-xs font-bold text-white mb-2">Artist/Band Name *</label>
                        <input type="text" placeholder="Your artist or band name" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-green-400" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-white mb-2">Primary Genre *</label>
                        <select className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-slate-400 focus:outline-none focus:border-green-400">
                            <option>Select your primary genre</option>
                            <option>Pop</option>
                            <option>Hip Hop</option>
                            <option>Electronic</option>
                            <option>Rock</option>
                        </select>
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-white mb-2">Target Audience</label>
                    <input type="text" placeholder="e.g., Young adults 18-30, indie music lovers, festival-goers" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-green-400" />
                </div>

                <div className="mb-6">
                    <label className="block text-xs font-bold text-white mb-2">Brand Personality</label>
                    <input type="text" placeholder="e.g., Authentic, energetic, mysterious, uplifting" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-green-400" />
                </div>

                <div className="mb-8">
                    <label className="block text-xs font-bold text-white mb-2">Career Goals (comma-separated)</label>
                    <textarea rows={3} placeholder="e.g., Build fanbase, get sync placements, tour internationally, release album" className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-green-400" />
                </div>

                <button 
                    onClick={handleGenerateStrategy}
                    disabled={isGeneratingStrategy}
                    className="w-full bg-green-200 text-green-900 hover:bg-green-300 font-bold py-3 rounded-full flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
                >
                    {isGeneratingStrategy ? (
                        <>Thinking...</>
                    ) : (
                        <><Sparkles className="w-4 h-4" /> Generate Brand Strategy</>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 mb-3 text-green-400">
                        <Target className="w-5 h-5" />
                        <h4 className="font-bold text-white">Consistency is Key</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">Maintain consistent visuals, messaging, and tone across all platforms to build recognition and trust with your audience.</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 mb-3 text-cyan-400">
                        <Heart className="w-5 h-5" />
                        <h4 className="font-bold text-white">Know Your Audience</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">Understanding your target audience's preferences, behaviors, and platforms helps you create more effective content.</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 mb-3 text-purple-400">
                        <MessageSquare className="w-5 h-5" />
                        <h4 className="font-bold text-white">Authentic Storytelling</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">Share your genuine story, struggles, and victories. Authentic content creates deeper connections with fans.</p>
                </div>
            </div>
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Controls Panel */}
             <div className="lg:col-span-1 bg-slate-850 rounded-xl border border-slate-800 p-6 h-fit">
                <div className="flex items-center gap-2 mb-6">
                    <ImageIcon className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg font-bold text-white">Visual Studio</h3>
                </div>

                {/* Mode Toggle */}
                <div className="flex bg-slate-900 p-1 rounded-lg mb-6">
                    <button 
                        onClick={() => { setVisualMode('create'); setGeneratedImage(null); setGeneratedVideo(null); }}
                        className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all ${visualMode === 'create' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Wand2 className="w-3 h-3" /> Create
                    </button>
                    <button 
                        onClick={() => { setVisualMode('enhance'); setGeneratedImage(null); setGeneratedVideo(null); }}
                        className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all ${visualMode === 'enhance' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Layers className="w-3 h-3" /> Enhance
                    </button>
                    <button 
                        onClick={() => { setVisualMode('animate'); setGeneratedImage(null); setGeneratedVideo(null); setAspectRatio('16:9'); }}
                        className={`flex-1 py-2 rounded-md text-xs font-bold flex items-center justify-center gap-2 transition-all ${visualMode === 'animate' ? 'bg-green-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                    >
                        <Video className="w-3 h-3" /> Animate
                    </button>
                </div>

                <div className="space-y-5">
                    {(visualMode === 'enhance' || visualMode === 'animate') && (
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-2">Upload Source Image</label>
                            
                            {uploadedImage ? (
                                <div className="relative rounded-xl overflow-hidden border border-slate-600 bg-slate-900 group">
                                    <div className="h-48 w-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
                                        <img 
                                            src={uploadedImage} 
                                            alt="Source" 
                                            className="w-full h-full object-contain" 
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors"
                                        >
                                            <Upload className="w-3 h-3" /> Change Image
                                        </button>
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setUploadedImage(null); 
                                                setDetectedObjects([]); 
                                                setGeneratedImage(null);
                                                setGeneratedVideo(null);
                                            }}
                                            className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-500 hover:text-white transition-colors border border-red-500/50"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </div>
                            ) : (
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-700 hover:border-cyan-500 hover:bg-slate-800/50 rounded-xl p-8 cursor-pointer bg-slate-900/30 text-center transition-all group"
                                >
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                                    </div>
                                    <p className="text-sm font-bold text-slate-300 group-hover:text-white">Click to upload photo</p>
                                    <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 10MB</p>
                                    <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </div>
                            )}
                        </div>
                    )}

                    {/* AI Editing Tools for Enhance Mode */}
                    {visualMode === 'enhance' && (
                        <>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <label className="block text-xs font-bold text-slate-400 mb-3">AI Editing Tools</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button 
                                        onClick={triggerRemoveBg}
                                        className="flex flex-col items-center justify-center p-2 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 hover:border-cyan-500/50 transition-all"
                                        title="Remove Background"
                                    >
                                        <Eraser className="w-5 h-5 text-red-400 mb-1" />
                                        <span className="text-[10px] text-slate-300">Remove BG</span>
                                    </button>
                                    
                                    <div className="relative group">
                                        <button className="w-full h-full flex flex-col items-center justify-center p-2 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 hover:border-purple-500/50 transition-all relative">
                                            <Palette className="w-5 h-5 text-purple-400 mb-1" />
                                            <span className="text-[10px] text-slate-300">Style Transfer</span>
                                            <select 
                                                onChange={(e) => applyStyle(e.target.value)}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                            >
                                                <option value="">Select Style...</option>
                                                <option value="Cyberpunk">Cyberpunk</option>
                                                <option value="Watercolor">Watercolor</option>
                                                <option value="Oil Painting">Oil Painting</option>
                                                <option value="Pencil Sketch">Pencil Sketch</option>
                                                <option value="3D Render">3D Render</option>
                                            </select>
                                        </button>
                                    </div>

                                    <button 
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing || !uploadedImage}
                                        className="flex flex-col items-center justify-center p-2 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 hover:border-green-500/50 transition-all disabled:opacity-50"
                                    >
                                        {isAnalyzing ? <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin mb-1"></div> : <Scan className="w-5 h-5 text-green-400 mb-1" />}
                                        <span className="text-[10px] text-slate-300">Detect Objects</span>
                                    </button>
                                </div>
                                {detectedObjects.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1.5 animate-in fade-in slide-in-from-top-2">
                                        {detectedObjects.map((obj, i) => (
                                            <span key={i} className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded-full border border-green-500/20">
                                                {obj}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Color & Tone Adjustments */}
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <div className="flex justify-between items-center mb-3">
                                    <label className="block text-xs font-bold text-slate-400">Color & Tone</label>
                                    <button onClick={resetAdjustments} className="text-[10px] text-cyan-400 flex items-center gap-1 hover:text-cyan-300">
                                        <RotateCcw className="w-3 h-3" /> Reset
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                            <span>Brightness</span>
                                            <span>{adjustments.brightness}%</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="200" value={adjustments.brightness} 
                                            onChange={(e) => setAdjustments({...adjustments, brightness: Number(e.target.value)})}
                                            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                            <span>Contrast</span>
                                            <span>{adjustments.contrast}%</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="200" value={adjustments.contrast} 
                                            onChange={(e) => setAdjustments({...adjustments, contrast: Number(e.target.value)})}
                                            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                            <span>Saturation</span>
                                            <span>{adjustments.saturation}%</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="200" value={adjustments.saturation} 
                                            onChange={(e) => setAdjustments({...adjustments, saturation: Number(e.target.value)})}
                                            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                            <span>Hue Rotate</span>
                                            <span>{adjustments.hue}°</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="360" value={adjustments.hue} 
                                            onChange={(e) => setAdjustments({...adjustments, hue: Number(e.target.value)})}
                                            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* GRANULAR CONTROLS FOR CREATE MODE */}
                    {visualMode === 'create' && (
                         <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 space-y-3">
                             <div className="flex gap-2 mb-2">
                                <button
                                    onClick={() => setAssetType('image')}
                                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-all flex items-center justify-center gap-1 ${assetType === 'image' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}
                                >
                                    <ImageIcon className="w-3 h-3" /> Image
                                </button>
                                <button
                                    onClick={() => { setAssetType('video'); setAspectRatio('16:9'); }}
                                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-all flex items-center justify-center gap-1 ${assetType === 'video' ? 'bg-green-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}
                                >
                                    <Clapperboard className="w-3 h-3" /> Video
                                </button>
                             </div>

                             <div className="grid grid-cols-2 gap-3">
                                 <div>
                                    <label className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mb-1">
                                        <Brush className="w-3 h-3" /> Art Style
                                    </label>
                                    <select value={artStyle} onChange={(e) => setArtStyle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-cyan-500">
                                        <option value="">None</option>
                                        {ART_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                 </div>
                                 <div>
                                    <label className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mb-1">
                                        <Camera className="w-3 h-3" /> Angle
                                    </label>
                                    <select value={camera} onChange={(e) => setCamera(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-cyan-500">
                                        <option value="">Default</option>
                                        {CAMERA_ANGLES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                 </div>
                             </div>
                             <div>
                                <label className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mb-1">
                                    <Sun className="w-3 h-3" /> Lighting
                                </label>
                                <select value={light} onChange={(e) => setLight(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-white focus:outline-none focus:border-cyan-500">
                                    <option value="">Default</option>
                                    {LIGHTING_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                             </div>
                         </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">
                            {visualMode === 'create' ? (assetType === 'video' ? 'Video Prompt' : 'Image Description') : visualMode === 'animate' ? 'Promo / Motion Description' : 'Enhancement Instructions'}
                        </label>
                        <textarea 
                            value={imgPrompt}
                            onChange={(e) => setImgPrompt(e.target.value)}
                            placeholder={
                                visualMode === 'create' ? (assetType === 'video' ? "e.g. A neon cyber city with flying cars zooming past, rain falling..." : "e.g. A futuristic cyberpunk album cover with neon lights and a robot...") :
                                visualMode === 'animate' ? "e.g. Make the lights flicker to the beat, smooth camera pan, promote my new single 'Midnight'..." :
                                "e.g. Make it look more cinematic, add blue and purple lighting, high contrast..."
                            }
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500 h-24 resize-none"
                        />
                    </div>

                    {visualMode === 'animate' && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                 <label className="block text-xs font-bold text-slate-400 mb-2">Motion Style</label>
                                 <select 
                                    value={motionStyle} 
                                    onChange={(e) => setMotionStyle(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                                >
                                     {MOTION_STYLES.map(ms => (
                                         <option key={ms.value} value={ms.value}>{ms.label}</option>
                                     ))}
                                 </select>
                            </div>
                            <div>
                                 <label className="block text-xs font-bold text-slate-400 mb-2">Music Vibe</label>
                                 <select 
                                    value={promoVibe} 
                                    onChange={(e) => setPromoVibe(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                                >
                                     {PROMO_VIBES.map(v => (
                                         <option key={v} value={v}>{v}</option>
                                     ))}
                                 </select>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        {visualMode !== 'animate' && assetType !== 'video' && (
                        <div>
                             <label className="block text-xs font-bold text-slate-400 mb-2">Quality / Size</label>
                             <select 
                                value={imgSize} 
                                onChange={(e) => setImgSize(e.target.value as ImageSize)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                            >
                                 <option value="1K">1K (Standard)</option>
                                 <option value="2K">2K (High Res)</option>
                                 <option value="4K">4K (Ultra)</option>
                             </select>
                        </div>
                        )}
                        <div className={visualMode === 'animate' || assetType === 'video' ? 'col-span-2' : ''}>
                             <label className="block text-xs font-bold text-slate-400 mb-2">Aspect Ratio</label>
                             <select 
                                value={aspectRatio} 
                                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                            >
                                {visualMode === 'animate' || assetType === 'video' ? (
                                    <>
                                        <option value="16:9">16:9 (Landscape Video)</option>
                                        <option value="9:16">9:16 (Portrait Video)</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="1:1">1:1 (Square)</option>
                                        <option value="9:16">9:16 (Story)</option>
                                        <option value="16:9">16:9 (Landscape)</option>
                                        <option value="3:4">3:4 (Portrait)</option>
                                    </>
                                )}
                             </select>
                        </div>
                    </div>

                    <button 
                        onClick={handleGeneration}
                        disabled={isGenerating || (!imgPrompt && visualMode === 'create') || ((visualMode === 'enhance' || visualMode === 'animate') && !uploadedImage)}
                        className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            visualMode === 'create' && assetType === 'video' ? 'bg-green-500 hover:bg-green-400 text-slate-950' :
                            visualMode === 'create' ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950' : 
                            visualMode === 'animate' ? 'bg-green-500 hover:bg-green-400 text-slate-950' :
                            'bg-purple-500 hover:bg-purple-400 text-white'
                        }`}
                    >
                        {isGenerating ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                {visualMode === 'animate' || assetType === 'video' ? 'Generating Video...' : 'Processing...'}
                            </div>
                        ) : (
                            <>
                                {visualMode === 'animate' || assetType === 'video' ? <Video className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />} 
                                {visualMode === 'create' 
                                    ? (assetType === 'video' ? 'Generate Video' : 'Generate Image') 
                                    : visualMode === 'animate' ? 'Generate Promo Video' : 'Enhance Image'
                                }
                            </>
                        )}
                    </button>
                    <p className="text-[10px] text-center text-slate-500">
                        Powered by {visualMode === 'animate' || assetType === 'video' ? 'Veo' : 'Gemini 3 Pro'}
                    </p>
                </div>
             </div>

             {/* Results Canvas */}
             <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-center relative overflow-hidden min-h-[500px]">
                {generatedVideo ? (
                     <div className="relative w-full h-full flex flex-col">
                         <div className="flex-1 p-8 flex items-center justify-center bg-black">
                            <video controls src={generatedVideo} className="max-w-full max-h-[500px] rounded-lg shadow-2xl border border-slate-700" />
                         </div>
                         <div className="bg-slate-850 border-t border-slate-800 p-4 flex justify-between items-center">
                             <div>
                                 <p className="text-white font-bold text-sm flex items-center gap-2">
                                     <Music className="w-4 h-4 text-cyan-400" />
                                     Generated Video Asset
                                 </p>
                                 <p className="text-xs text-slate-400">720p • {aspectRatio} • Veo</p>
                             </div>
                             <a href={generatedVideo} download="generated-video.mp4" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                 <Download className="w-4 h-4" /> Download
                             </a>
                         </div>
                    </div>
                ) : activeImage ? (
                    <div className="relative w-full h-full flex flex-col">
                         <div className="flex-1 p-8 flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat">
                            <img 
                                src={activeImage} 
                                alt="Result" 
                                className="max-w-full max-h-[500px] rounded-lg shadow-2xl border border-slate-700 transition-all duration-200" 
                                style={{
                                    filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%) hue-rotate(${adjustments.hue}deg)`
                                }}
                            />
                         </div>
                         <div className="bg-slate-850 border-t border-slate-800 p-4 flex justify-between items-center">
                             <div>
                                 <p className="text-white font-bold text-sm">{generatedImage ? 'Generated Asset' : 'Source Image Preview'}</p>
                                 <p className="text-xs text-slate-400">{imgSize} • {aspectRatio} • Filters Applied</p>
                             </div>
                             {generatedImage && (
                                 <a href={generatedImage} download="brand-asset.png" className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                                     <Download className="w-4 h-4" /> Download
                                 </a>
                             )}
                         </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-500 max-w-sm px-4">
                        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            {visualMode === 'animate' || assetType === 'video' ? <Video className="w-10 h-10 opacity-50" /> : <ImageIcon className="w-10 h-10 opacity-50" />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-400 mb-2">Visual Workspace</h3>
                        <p className="text-sm">
                            {visualMode === 'animate' 
                                ? "Select \"Animate\" to create stunning music videos, canvas loops, and social teasers with Veo." 
                                : "Select \"Create\" to generate new assets, or \"Enhance\" to refine existing photos with AI tools."}
                        </p>
                    </div>
                )}
             </div>
        </div>
      )}
    </div>
  );
};
