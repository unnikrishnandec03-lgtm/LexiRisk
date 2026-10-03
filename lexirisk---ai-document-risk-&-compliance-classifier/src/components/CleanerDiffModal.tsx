import React, { useState } from 'react';
import { X, Sparkles, Filter, CheckCircle2, ArrowRight } from 'lucide-react';
import { DocumentClassification } from '../types';

interface CleanerDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentClassification;
}

export const CleanerDiffModal: React.FC<CleanerDiffModalProps> = ({
  isOpen,
  onClose,
  document
}) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'cleaned-only' | 'raw-only'>('side-by-side');

  if (!isOpen) return null;

  const { cleanSummary, rawText, cleanedText } = document;
  const reductionPercent = cleanSummary.originalLength > 0
    ? Math.round(((cleanSummary.originalLength - cleanSummary.cleanedLength) / cleanSummary.originalLength) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#121812] border border-[#232f23] rounded-3xl max-w-5xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232f23] bg-[#0d130d]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-lime-950/80 text-lime-400 border border-lime-700/50 shadow-sm">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">Text Extraction &amp; Formatting Cleaner Audit</h2>
                <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-950/70 px-2 py-0.5 rounded-full border border-lime-800/40">
                  Step 2 Pipeline
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspecting normalization pass for: <span className="text-white font-medium">{document.documentTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View switcher */}
            <div className="flex items-center bg-[#080d08] p-1 rounded-full border border-[#232f23] text-xs">
              <button
                onClick={() => setViewMode('side-by-side')}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  viewMode === 'side-by-side' ? 'bg-[#a3e635] text-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Side-by-Side
              </button>
              <button
                onClick={() => setViewMode('cleaned-only')}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  viewMode === 'cleaned-only' ? 'bg-[#a3e635] text-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cleaned Only
              </button>
              <button
                onClick={() => setViewMode('raw-only')}
                className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                  viewMode === 'raw-only' ? 'bg-[#a3e635] text-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Raw Input
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Extraction Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 py-3.5 bg-[#0e140e] border-b border-[#232f23] text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] font-mono">Raw Characters</span>
            <span className="font-mono text-white text-sm font-bold">{cleanSummary.originalLength.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-mono">Cleaned Characters</span>
            <span className="font-mono text-lime-400 text-sm font-bold">{cleanSummary.cleanedLength.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-mono">Noise Removed</span>
            <span className="font-mono text-lime-400 text-sm font-bold">{reductionPercent}% reduction ({cleanSummary.linesRemoved} lines)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-mono">Artifacts Filtered</span>
            <span className="text-slate-200 font-medium truncate block font-mono text-[11px]" title={cleanSummary.artifactsFiltered.join(', ')}>
              {cleanSummary.artifactsFiltered.join(', ')}
            </span>
          </div>
        </div>

        {/* Content Comparison View */}
        <div className="flex-1 overflow-hidden p-6 bg-[#0a0f0a]">
          {viewMode === 'side-by-side' && (
            <div className="grid grid-cols-2 gap-4 h-full">
              {/* Raw Column */}
              <div className="flex flex-col h-full rounded-2xl border border-[#232f23] bg-[#0d130d] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#232f23] bg-[#111711] flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold font-mono text-[11px]">Raw Extracted Document / PDF Text</span>
                  <span className="text-[10px] font-mono text-slate-500">Unfiltered input</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-400 whitespace-pre-wrap leading-relaxed select-text">
                  {rawText}
                </div>
              </div>

              {/* Cleaned Column */}
              <div className="flex flex-col h-full rounded-2xl border border-lime-800/40 bg-[#0d130d] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-lime-800/40 bg-lime-950/20 flex items-center justify-between text-xs">
                  <span className="text-lime-300 font-semibold flex items-center gap-1.5 font-mono text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-lime-400" />
                    Cleaned &amp; Normalized Text (Classifier Input)
                  </span>
                  <span className="text-[10px] font-mono text-lime-400 font-bold">Noise stripped</span>
                </div>
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
                  {cleanedText}
                </div>
              </div>
            </div>
          )}

          {viewMode === 'cleaned-only' && (
            <div className="h-full rounded-2xl border border-lime-800/40 bg-[#0d130d] overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 border-b border-lime-800/40 bg-lime-950/20 text-xs text-lime-300 font-semibold font-mono text-[11px]">
                Normalized Document Text
              </div>
              <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-text">
                {cleanedText}
              </div>
            </div>
          )}

          {viewMode === 'raw-only' && (
            <div className="h-full rounded-2xl border border-[#232f23] bg-[#0d130d] overflow-hidden flex flex-col">
              <div className="px-4 py-2.5 border-b border-[#232f23] bg-[#111711] text-xs text-slate-300 font-semibold font-mono text-[11px]">
                Raw Extracted Input
              </div>
              <div className="flex-1 p-5 overflow-y-auto font-mono text-xs text-slate-400 whitespace-pre-wrap leading-relaxed select-text">
                {rawText}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#232f23] bg-[#0d130d] flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">Operations: Stripped OCR line headers, page breaks, draft timestamps, and regularized whitespace.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#1a251a] hover:bg-[#233323] text-white font-semibold rounded-full border border-[#2e3e2e] transition-colors cursor-pointer"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
