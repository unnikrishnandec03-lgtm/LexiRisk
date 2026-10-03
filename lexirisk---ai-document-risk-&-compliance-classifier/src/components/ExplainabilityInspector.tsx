import React, { useState } from 'react';
import { Search, Info, TrendingUp, TrendingDown, Eye, Check } from 'lucide-react';
import { TermSaliency } from '../types';

interface ExplainabilityInspectorProps {
  saliencyTerms: TermSaliency[];
  documentText: string;
}

export const ExplainabilityInspector: React.FC<ExplainabilityInspectorProps> = ({
  saliencyTerms,
  documentText
}) => {
  const [selectedTerm, setSelectedTerm] = useState<string | null>(
    saliencyTerms[0]?.term || null
  );

  const riskElevating = saliencyTerms.filter((t) => t.weight > 0);
  const riskMitigating = saliencyTerms.filter((t) => t.weight < 0);

  // Highlight selected term in document preview
  const renderHighlightedDocument = () => {
    if (!selectedTerm) return documentText;

    const regex = new RegExp(`(${selectedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = documentText.split(regex);

    return parts.map((part, i) => {
      if (part.toLowerCase() === selectedTerm.toLowerCase()) {
        const isNegative = (saliencyTerms.find(t => t.term.toLowerCase() === selectedTerm.toLowerCase())?.weight || 0) < 0;
        return (
          <mark
            key={i}
            className={`px-1.5 py-0.5 rounded font-bold ${
              isNegative
                ? 'bg-lime-400/30 text-lime-200 border-b-2 border-lime-400'
                : 'bg-rose-500/30 text-rose-200 border-b-2 border-rose-500'
            }`}
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-4 text-xs">
      
      {/* Intro Banner */}
      <div className="p-4 bg-[#0e140e] rounded-2xl border border-[#232f23] flex items-start gap-3">
        <Info className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
        <div className="text-slate-300 leading-relaxed text-[11px]">
          <strong className="text-white">Feature Saliency &amp; TF-IDF Feature Attribution:</strong> Mathematical importance assigned by the neural classifier to trigger phrases. 
          Positive weights (<span className="text-rose-400 font-semibold">+0.1 to +1.0</span>) elevate risk tier. Negative weights (<span className="text-lime-400 font-semibold">-0.1 to -1.0</span>) mitigate liability.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Saliency Ranking Bars (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Risk Elevators */}
          <div className="bg-[#0e140e] rounded-2xl border border-[#232f23] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-300 flex items-center gap-1.5 text-xs font-mono">
                <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                Top Risk-Elevating Terms (+Δ)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Weight (Count)</span>
            </div>

            <div className="space-y-2">
              {riskElevating.length === 0 ? (
                <div className="text-[11px] text-slate-500 italic py-2">No aggressive risk terms identified.</div>
              ) : (
                riskElevating.map((item) => {
                  const isSelected = selectedTerm?.toLowerCase() === item.term.toLowerCase();
                  return (
                    <button
                      key={item.term}
                      onClick={() => setSelectedTerm(item.term)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-1 border cursor-pointer ${
                        isSelected
                          ? 'bg-rose-950/40 border-rose-600/70 text-rose-200 ring-1 ring-rose-500/50'
                          : 'bg-[#121912] border-[#222e22] text-slate-300 hover:bg-[#182318] hover:border-lime-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-medium truncate">"{item.term}"</span>
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <span className="text-slate-400 font-semibold">{item.count}x</span>
                          <span className="text-rose-400 font-bold">+{item.weight.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Bar indicator */}
                      <div className="w-full bg-[#1c261c] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${Math.round(Math.abs(item.weight) * 100)}%` }}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Risk Mitigators */}
          <div className="bg-[#0e140e] rounded-2xl border border-[#232f23] p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lime-300 flex items-center gap-1.5 text-xs font-mono">
                <TrendingDown className="w-3.5 h-3.5 text-lime-400" />
                Mitigating Safe Harbor Terms (-Δ)
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Weight (Count)</span>
            </div>

            <div className="space-y-2">
              {riskMitigating.length === 0 ? (
                <div className="text-[11px] text-slate-500 italic py-2">No standard mitigating caps detected.</div>
              ) : (
                riskMitigating.map((item) => {
                  const isSelected = selectedTerm?.toLowerCase() === item.term.toLowerCase();
                  return (
                    <button
                      key={item.term}
                      onClick={() => setSelectedTerm(item.term)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex flex-col gap-1 border cursor-pointer ${
                        isSelected
                          ? 'bg-lime-950/40 border-lime-600/70 text-lime-200 ring-1 ring-lime-500/50'
                          : 'bg-[#121912] border-[#222e22] text-slate-300 hover:bg-[#182318] hover:border-lime-900/60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-medium truncate">"{item.term}"</span>
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <span className="text-slate-400 font-semibold">{item.count}x</span>
                          <span className="text-lime-400 font-bold">{item.weight.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="w-full bg-[#1c261c] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#a3e635] h-full rounded-full"
                          style={{ width: `${Math.round(Math.abs(item.weight) * 100)}%` }}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Context Reader with Interactive Saliency Highlighting (7 cols) */}
        <div className="lg:col-span-7 bg-[#0e140e] rounded-2xl border border-[#232f23] p-5 flex flex-col h-[480px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#232f23] text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-white font-mono">
              <Eye className="w-3.5 h-3.5 text-lime-400" />
              Saliency In-Document Highlighting
            </span>
            <span className="font-mono text-[11px]">
              Active Term: <strong className="text-lime-300 font-bold">"{selectedTerm || 'None'}"</strong>
            </span>
          </div>

          <div className="flex-1 mt-3 overflow-y-auto p-4 bg-[#080d08] rounded-xl border border-[#1e2a1e] font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap select-text">
            {renderHighlightedDocument()}
          </div>

          <div className="mt-2.5 text-[10px] text-slate-500 flex items-center justify-between font-mono">
            <span>Click any term in the left pane to jump and highlight occurrences</span>
            <span className="text-lime-400">TF-IDF Active</span>
          </div>
        </div>

      </div>

    </div>
  );
};
