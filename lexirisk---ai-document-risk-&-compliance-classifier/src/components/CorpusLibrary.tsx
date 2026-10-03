import React, { useState } from 'react';
import { Database, FileText, Check, Copy, ArrowRight, ShieldAlert, Sparkles, Filter, ArrowUpRight } from 'lucide-react';
import { SAMPLE_DOCUMENTS, SampleDoc } from '../data/sampleDocuments';
import { ComplianceCategory, RiskTier } from '../types';

interface CorpusLibraryProps {
  onAnalyzeSample: (sample: SampleDoc) => void;
  onOpenSyntheticModal: () => void;
}

export const CorpusLibrary: React.FC<CorpusLibraryProps> = ({
  onAnalyzeSample,
  onOpenSyntheticModal
}) => {
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredDocs = SAMPLE_DOCUMENTS.filter((doc) => {
    if (selectedRiskFilter === 'ALL') return true;
    return doc.expectedRisk === selectedRiskFilter;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRiskBadge = (tier: RiskTier) => {
    switch (tier) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/70 border-rose-800/80';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/70 border-orange-800/80';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-950/70 border-amber-800/80';
      case 'LOW':
        return 'text-[#a3e635] bg-lime-950/70 border-lime-700/80';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#121812] border border-[#232f23] rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232f23]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-950/70 px-2.5 py-0.5 rounded-full border border-lime-800/40">
                BENCHMARK CORPUS
              </span>
              <h2 className="text-sm font-bold text-white tracking-tight">Document Corpus &amp; Compliance Taxonomy Library</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Standardized ground-truth contract dataset across 7 compliance policy domains and 4 risk severity tiers.
            </p>
          </div>

          <button
            onClick={onOpenSyntheticModal}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-black bg-[#a3e635] hover:bg-[#bef264] rounded-full shadow-[0_0_15px_rgba(163,230,53,0.35)] transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Edge-Case Contract</span>
          </button>
        </div>

        {/* Taxonomy Quick Guide */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 bg-[#0e140e] rounded-2xl border border-[#232f23]">
            <span className="text-rose-400 font-bold font-mono text-[11px] block">CRITICAL RISK</span>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">Direct statutory violation, AML/sanctions evasion, non-KYC cash payments, FCPA bribery.</p>
          </div>
          <div className="p-4 bg-[#0e140e] rounded-2xl border border-[#232f23]">
            <span className="text-orange-400 font-bold font-mono text-[11px] block">HIGH RISK</span>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">Unlimited liability, unilateral customer indemnity, missing EU SCCs, ITAR export licensing waiver.</p>
          </div>
          <div className="p-4 bg-[#0e140e] rounded-2xl border border-[#232f23]">
            <span className="text-amber-400 font-bold font-mono text-[11px] block">MEDIUM RISK</span>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">Asymmetrical 2x-5x liability caps, vague 99.0% SLA remedies, restricted 3-year audit windows.</p>
          </div>
          <div className="p-4 bg-[#0e140e] rounded-2xl border border-[#232f23]">
            <span className="text-lime-400 font-bold font-mono text-[11px] block">LOW RISK</span>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">Market standard mutual NDA, capped 12-month fees, standard commercial lease covenants.</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs (Matches reference design chips) */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((tier) => {
            const isActive = selectedRiskFilter === tier;
            return (
              <button
                key={tier}
                onClick={() => setSelectedRiskFilter(tier)}
                className={`px-4 py-1.5 rounded-full font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                    : 'bg-[#121812] hover:bg-[#1a231a] text-slate-300 border border-[#232f23]'
                }`}
              >
                {tier === 'ALL' ? 'All Contracts (8)' : `${tier} Risk`}
              </button>
            );
          })}
        </div>

        <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">
          Showing {filteredDocs.length} benchmark documents
        </span>
      </div>

      {/* Benchmark Contracts Grid (Matches Reference Image Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-3xl bg-[#121812] border border-[#232f23] hover:border-lime-900/60 shadow-xl space-y-4 flex flex-col justify-between group transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-medium text-slate-400">{doc.type}</span>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold ${getRiskBadge(doc.expectedRisk)}`}>
                  {doc.expectedRisk} RISK
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white group-hover:text-lime-300 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{doc.description}</p>
              </div>

              {/* Snippet box */}
              <div className="p-3 bg-[#0a0f0a] rounded-2xl border border-[#1e2a1e] font-mono text-xs text-slate-300 max-h-28 overflow-y-auto leading-relaxed select-text">
                {doc.content.slice(0, 320)}...
              </div>
            </div>

            {/* Footer action bar */}
            <div className="pt-3 border-t border-[#232f23] flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-lime-400 font-semibold uppercase">
                {doc.expectedCategory.replace(/_/g, ' ')}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(doc.content, doc.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#182318] hover:bg-[#202e20] text-slate-300 hover:text-white border border-[#2b3c2b] transition-colors cursor-pointer text-xs"
                >
                  {copiedId === doc.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-lime-400" />
                      <span className="text-lime-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onAnalyzeSample(doc)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#a3e635] hover:bg-[#bef264] text-black font-bold text-xs shadow-sm transition-all cursor-pointer"
                >
                  <span>Classify Document</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
