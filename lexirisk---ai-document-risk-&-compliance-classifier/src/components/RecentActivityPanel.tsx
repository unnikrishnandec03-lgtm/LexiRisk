import React from 'react';
import { History, FileDown, ArrowUpRight, Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { DocumentClassification, RiskTier } from '../types';

interface RecentActivityPanelProps {
  recentDocuments: DocumentClassification[];
  currentDocumentId?: string;
  onSelectDocument: (doc: DocumentClassification) => void;
  onExportPdf: (doc: DocumentClassification) => void;
}

export const RecentActivityPanel: React.FC<RecentActivityPanelProps> = ({
  recentDocuments,
  currentDocumentId,
  onSelectDocument,
  onExportPdf
}) => {
  if (recentDocuments.length === 0) return null;

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

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-3">
      {/* Section Header (Matches "Upcoming Events" with "Sort by" from Image) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-white tracking-tight">Recent Activity</h2>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-lime-950/60 border border-lime-800/40 text-[10px] font-mono text-lime-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
            Live Sync
          </span>
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Select contract to inspect
        </span>
      </div>

      {/* Grid of Cards (Matches image cards with rounded-2xl and round arrow button) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {recentDocuments.map((doc) => {
          const isSelected = doc.id === currentDocumentId;
          const effectiveTier = doc.auditReview.overriddenRiskTier || doc.riskTier;

          return (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group relative ${
                isSelected
                  ? 'bg-[#182318] border-[#a3e635] shadow-[0_0_20px_rgba(163,230,53,0.18)]'
                  : 'bg-[#121812] border-[#222e22] hover:bg-[#192219] hover:border-lime-900/60'
              }`}
            >
              <div>
                {/* Top row: Risk Tier Pill + Time */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold ${getRiskBadge(effectiveTier)}`}>
                    {effectiveTier} · {doc.riskScore}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTimeAgo(doc.createdAt)}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className={`font-semibold text-xs line-clamp-2 transition-colors ${
                    isSelected ? 'text-lime-300' : 'text-slate-100 group-hover:text-lime-200'
                  }`}
                  title={doc.documentTitle}
                >
                  {doc.documentTitle}
                </h3>

                {/* Compliance Class */}
                <div className="text-[11px] text-slate-400 mt-1 truncate">
                  {doc.primaryCategory.replace(/_/g, ' ')}
                </div>
              </div>

              {/* Bottom Quick-Action Row (Round arrow button matches reference image) */}
              <div
                className="mt-3 pt-2.5 border-t border-[#232f23] flex items-center justify-between"
                onClick={(e) => e.stopPropagation()}
              >
                <span className={`text-[10px] font-mono font-semibold ${
                  doc.isFlaggedForManualReview ? 'text-amber-400' : 'text-lime-400'
                }`}>
                  {doc.auditReview.status === 'PENDING_REVIEW'
                    ? 'Flagged'
                    : doc.auditReview.status.replace(/_/g, ' ')}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onExportPdf(doc)}
                    className="p-1.5 text-slate-400 hover:text-white bg-[#0e140e] hover:bg-[#1a231a] rounded-full border border-[#232f23] transition-colors"
                    title="Export PDF Summary"
                  >
                    <FileDown className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onSelectDocument(doc)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#a3e635] text-black shadow-sm'
                        : 'bg-[#1a241a] text-slate-300 group-hover:bg-[#a3e635] group-hover:text-black'
                    }`}
                    title="Open in Workbench"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
