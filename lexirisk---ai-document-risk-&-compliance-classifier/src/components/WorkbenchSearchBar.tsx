import React, { useState, useMemo } from 'react';
import { Search, X, Filter, ArrowUpRight, ShieldAlert, Sparkles, SlidersHorizontal, AlertCircle } from 'lucide-react';
import { DocumentClassification, RiskTier } from '../types';

interface WorkbenchSearchBarProps {
  documents: DocumentClassification[];
  activeDocumentId?: string;
  onSelectDocument: (doc: DocumentClassification) => void;
}

export const WorkbenchSearchBar: React.FC<WorkbenchSearchBarProps> = ({
  documents,
  activeDocumentId,
  onSelectDocument
}) => {
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  // Search logic
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();

    return documents.filter((doc) => {
      const effectiveTier = doc.auditReview.overriddenRiskTier || doc.riskTier;

      // Filter category check
      if (selectedFilter === 'CRITICAL' && effectiveTier !== 'CRITICAL') return false;
      if (selectedFilter === 'HIGH' && effectiveTier !== 'HIGH') return false;
      if (selectedFilter === 'MEDIUM' && effectiveTier !== 'MEDIUM') return false;
      if (selectedFilter === 'LOW' && effectiveTier !== 'LOW') return false;
      if (selectedFilter === 'PENDING' && doc.auditReview.status !== 'PENDING_REVIEW') return false;
      if (selectedFilter === 'LIABILITY' && !doc.primaryCategory.includes('LIABILITY')) return false;
      if (selectedFilter === 'GDPR' && !doc.primaryCategory.includes('GDPR') && !doc.primaryCategory.includes('PRIVACY')) return false;
      if (selectedFilter === 'AML' && !doc.primaryCategory.includes('AML')) return false;

      if (!q) return true;

      // Text query match
      if (doc.documentTitle.toLowerCase().includes(q)) return true;
      if (doc.primaryCategory.toLowerCase().includes(q)) return true;
      if (doc.cleanedText.toLowerCase().includes(q) || doc.rawText.toLowerCase().includes(q)) return true;
      if (doc.clauses.some((c) => c.originalText.toLowerCase().includes(q) || c.clauseTitle.toLowerCase().includes(q))) return true;

      return false;
    });
  }, [documents, query, selectedFilter]);

  const categories = [
    { id: 'ALL', label: 'All' },
    { id: 'CRITICAL', label: 'Critical Risk' },
    { id: 'HIGH', label: 'High Risk' },
    { id: 'MEDIUM', label: 'Medium' },
    { id: 'LOW', label: 'Low Risk' },
    { id: 'PENDING', label: 'Pending Review' },
    { id: 'LIABILITY', label: 'Liability' },
    { id: 'GDPR', label: 'GDPR' },
    { id: 'AML', label: 'AML' }
  ];

  const getRiskPillColor = (tier: RiskTier) => {
    switch (tier) {
      case 'CRITICAL':
        return 'text-rose-400 bg-rose-950/60 border-rose-800/60';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/60 border-orange-800/60';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-950/60 border-amber-800/60';
      case 'LOW':
        return 'text-lime-400 bg-lime-950/60 border-lime-800/60';
    }
  };

  return (
    <div className="space-y-3.5">
      
      {/* Search Input Bar (Matches Image Left Screen) */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-3 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search contracts, content keywords, or liability clauses..."
            className="w-full pl-11 pr-10 py-2.5 bg-[#121812] border border-[#232f23] focus:border-lime-500/80 rounded-2xl text-xs text-white placeholder:text-slate-500 focus:outline-none transition-all shadow-inner font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-2.5 text-slate-400 hover:text-white p-0.5 rounded-full"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Icon Button */}
        <div className="w-10 h-10 rounded-2xl bg-[#121812] border border-[#232f23] flex items-center justify-center text-slate-300 hover:text-lime-400 hover:border-lime-500/50 transition-colors cursor-pointer shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
      </div>

      {/* Category Pills (Active = Bright Lime, Inactive = Dark Glass - exactly like image.png) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedFilter(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                  : 'bg-[#121812] hover:bg-[#1a231a] text-slate-300 border border-[#232f23]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Filtered Results Drawer when searching or filtered */}
      {(query || selectedFilter !== 'ALL') && (
        <div className="bg-[#101710] border border-[#232f23] rounded-2xl p-3.5 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>
              Matching Contracts: <strong className="text-lime-400">{searchResults.length}</strong> of {documents.length}
            </span>
            <button
              onClick={() => {
                setQuery('');
                setSelectedFilter('ALL');
              }}
              className="text-lime-400 hover:text-lime-300 underline font-sans text-xs"
            >
              Reset filters
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto">
            {searchResults.length === 0 ? (
              <div className="col-span-full py-4 text-center text-xs text-slate-500">
                No contracts match the current search filters.
              </div>
            ) : (
              searchResults.map((doc) => {
                const isSelected = doc.id === activeDocumentId;
                const effectiveTier = doc.auditReview.overriddenRiskTier || doc.riskTier;
                return (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDocument(doc)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#182218] border-lime-500 shadow-md ring-1 ring-lime-500/40'
                        : 'bg-[#131913] border-[#222e22] hover:bg-[#1a241a] hover:border-lime-800/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1 text-[10px] font-mono">
                        <span className={`px-2 py-0.5 rounded-full border ${getRiskPillColor(effectiveTier)} font-semibold`}>
                          {effectiveTier} ({doc.riskScore})
                        </span>
                        <span className="text-slate-500 truncate max-w-[100px]">{doc.primaryCategory.replace(/_/g, ' ')}</span>
                      </div>
                      <h4 className="font-semibold text-white line-clamp-1 group-hover:text-lime-300">
                        {doc.documentTitle}
                      </h4>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-[#232f23] flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 text-[10px]">
                        {doc.isFlaggedForManualReview ? 'Flagged' : 'Cleared'}
                      </span>
                      <span className="text-lime-400 font-semibold flex items-center gap-0.5">
                        Inspect <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
};
