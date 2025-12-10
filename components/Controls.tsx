import React from 'react';
import { HalftoneSettings } from '../types';

interface ControlsProps {
  settings: HalftoneSettings;
  onChange: (settings: HalftoneSettings) => void;
  onDownloadPng: () => void;
  onDownloadSvg: () => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  hasImage: boolean;
  t: any; // Localization object
}

export const Controls: React.FC<ControlsProps> = ({ 
  settings, 
  onChange, 
  onDownloadPng,
  onDownloadSvg,
  onAnalyze,
  isAnalyzing,
  hasImage,
  t
}) => {
  const handleChange = <K extends keyof HalftoneSettings>(key: K, value: HalftoneSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="w-full lg:w-80 bg-slate-800 border-l border-slate-700 p-6 flex flex-col gap-6 h-full overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold text-white mb-1">{t.configTitle}</h2>
        <p className="text-sm text-slate-400">{t.configSubtitle}</p>
      </div>

      {/* Grid Size */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-slate-300">{t.gridSpacing}</label>
          <span className="text-sm text-slate-500">{settings.gridSize}px</span>
        </div>
        <input 
          type="range" 
          min="4" 
          max="50" 
          value={settings.gridSize} 
          onChange={(e) => handleChange('gridSize', parseInt(e.target.value))}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
        <p className="text-xs text-slate-500">{t.gridDesc}</p>
      </div>

      {/* Max Dot Scale */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-slate-300">{t.maxDotSize}</label>
          <span className="text-sm text-slate-500">{(settings.maxRadiusScale * 100).toFixed(0)}%</span>
        </div>
        <input 
          type="range" 
          min="0.1" 
          max="1.5" 
          step="0.05"
          value={settings.maxRadiusScale} 
          onChange={(e) => handleChange('maxRadiusScale', parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* Min Dot Scale */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-slate-300">{t.minDotSize}</label>
          <span className="text-sm text-slate-500">{(settings.minRadius * 100).toFixed(0)}%</span>
        </div>
        <input 
          type="range" 
          min="0.0" 
          max="1.0" 
          step="0.05"
          value={settings.minRadius} 
          onChange={(e) => handleChange('minRadius', parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

       {/* Contrast */}
       <div className="space-y-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-slate-300">{t.contrast}</label>
          <span className="text-sm text-slate-500">{settings.contrast.toFixed(1)}x</span>
        </div>
        <input 
          type="range" 
          min="0.5" 
          max="3.0" 
          step="0.1"
          value={settings.contrast} 
          onChange={(e) => handleChange('contrast', parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{t.dotColor}</label>
          <div className="flex items-center space-x-2">
            <input 
              type="color" 
              value={settings.dotColor}
              onChange={(e) => handleChange('dotColor', e.target.value)}
              className="h-10 w-full bg-slate-700 rounded cursor-pointer border-0 p-1"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">{t.bgColor}</label>
          <div className="flex items-center space-x-2">
            <input 
              type="color" 
              value={settings.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              className="h-10 w-full bg-slate-700 rounded cursor-pointer border-0 p-1"
            />
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="flex items-center justify-between py-2">
        <label className="text-sm font-medium text-slate-300">{t.invert}</label>
        <button 
          onClick={() => handleChange('invert', !settings.invert)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.invert ? 'bg-indigo-600' : 'bg-slate-600'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.invert ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="mt-auto space-y-3 pt-6 border-t border-slate-700">
        <button
          onClick={onAnalyze}
          disabled={!hasImage || isAnalyzing}
          className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isAnalyzing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t.processing}
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {t.analyze}
            </>
          )}
        </button>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onDownloadPng}
            disabled={!hasImage}
            className="flex items-center justify-center px-3 py-3 border border-slate-600 text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            PNG
          </button>
          <button
            onClick={onDownloadSvg}
            disabled={!hasImage}
            className="flex items-center justify-center px-3 py-3 border border-slate-600 text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            SVG
          </button>
        </div>
      </div>
    </div>
  );
};