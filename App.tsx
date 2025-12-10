import React, { useState, useRef, useCallback } from 'react';
import { Controls } from './components/Controls';
import { HalftoneCanvas, HalftoneCanvasHandle } from './components/HalftoneCanvas';
import { HalftoneSettings, AIAnalysisResult, Language } from './types';
import { analyzeImageArt } from './services/geminiService';

const TRANSLATIONS = {
  en: {
    title: 'DotMatrix',
    studio: 'Studio',
    upload: 'Upload Image',
    configTitle: 'Configuration',
    configSubtitle: 'Tweaking the matrix',
    gridSpacing: 'Grid Spacing (px)',
    gridDesc: 'Distance between dot centers',
    maxDotSize: 'Max Dot Size',
    minDotSize: 'Min Dot Size',
    contrast: 'Contrast Boost',
    dotColor: 'Dot Color',
    bgColor: 'Background',
    invert: 'Invert Brightness',
    processing: 'AI Processing...',
    analyze: 'AI Artistic Analysis',
    startPrompt: 'Upload an image to start',
    dropPrompt: 'Drag & drop or select file',
    analysisTitle: 'AI Analysis'
  },
  zh: {
    title: '点阵',
    studio: '工作室',
    upload: '上传图片',
    configTitle: '参数设置',
    configSubtitle: '调整点阵矩阵',
    gridSpacing: '网格间距 (px)',
    gridDesc: '圆点中心之间的距离',
    maxDotSize: '最大圆点尺寸',
    minDotSize: '最小圆点尺寸',
    contrast: '对比度增强',
    dotColor: '圆点颜色',
    bgColor: '背景颜色',
    invert: '反转亮度',
    processing: 'AI 处理中...',
    analyze: 'AI 艺术分析',
    startPrompt: '上传图片开始',
    dropPrompt: '拖拽或选择文件',
    analysisTitle: 'AI 分析'
  }
};

function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [settings, setSettings] = useState<HalftoneSettings>({
    gridSize: 10,
    minRadius: 0.2, 
    maxRadiusScale: 0.9, 
    dotColor: '#000000',
    backgroundColor: '#ffffff',
    invert: false,
    contrast: 1.0,
  });
  
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const halftoneRef = useRef<HalftoneCanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setImageSrc(event.target.result);
          setAnalysis(null); // Reset analysis on new image
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadPng = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `dotmatrix-${Date.now()}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  const handleDownloadSvg = () => {
    if (halftoneRef.current) {
      halftoneRef.current.generateSVG();
    }
  };

  const handleAnalyze = async () => {
    if (!imageSrc) return;
    setIsAnalyzing(true);
    
    try {
      // Extract base64 without prefix
      const base64Data = imageSrc.split(',')[1];
      const result = await analyzeImageArt(base64Data, 'image/png', language);
      setAnalysis(result);
    } catch (error) {
      alert("AI Analysis failed. Check console or API Key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-900 overflow-hidden">
      {/* Header */}
      <header className="flex-none h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full mx-0.5 opacity-50"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-full mx-0.5"></div>
            <div className="w-1 h-1 bg-white rounded-full mx-0.5 opacity-50"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">{t.title} <span className="text-indigo-500">{t.studio}</span></h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setLanguage(l => l === 'en' ? 'zh' : 'en')}
            className="text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700 transition-colors"
          >
            {language === 'en' ? '中文' : 'English'}
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md text-sm font-medium transition-colors border border-slate-700"
          >
             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             {t.upload}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Canvas Area */}
        <div className="flex-1 relative bg-slate-900 flex flex-col">
          <HalftoneCanvas 
            ref={halftoneRef}
            imageSrc={imageSrc} 
            settings={settings} 
            onCanvasReady={handleCanvasReady}
            t={t}
          />
          
          {/* AI Analysis Overlay/Modal if active */}
          {analysis && (
            <div className="absolute bottom-6 left-6 right-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-full lg:max-w-2xl bg-slate-900/90 backdrop-blur-md border border-slate-700 p-6 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-10 z-20">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-indigo-400 text-xs font-bold uppercase tracking-wider">{t.analysisTitle}</h3>
                <button onClick={() => setAnalysis(null)} className="text-slate-500 hover:text-white">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">{analysis.title}</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">{analysis.description}</p>
              <div className="flex flex-wrap gap-2">
                {analysis.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-full border border-indigo-500/30">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Controls */}
        <Controls 
          settings={settings} 
          onChange={setSettings} 
          onDownloadPng={handleDownloadPng}
          onDownloadSvg={handleDownloadSvg}
          onAnalyze={handleAnalyze}
          isAnalyzing={isAnalyzing}
          hasImage={!!imageSrc}
          t={t}
        />
      </main>
    </div>
  );
}

export default App;