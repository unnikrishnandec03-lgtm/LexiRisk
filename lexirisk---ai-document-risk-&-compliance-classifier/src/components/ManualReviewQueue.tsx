import React, { useState } from 'react';
import {
  CheckSquare,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  Sliders,
  CheckCircle,
  Clock,
  ArrowUpDown,
  FileText,
  X,
  ShieldAlert,
  ArrowUpRight,
  UserCheck
} from 'lucide-react';
import { DocumentClassification, ReviewStatus, RiskTier } from '../types';

interface ManualReviewQueueProps {
  documents: DocumentClassification[];
  onSelectDocument: (doc: DocumentClassification) => void;
  onOpenReviewDrawer: (doc: DocumentClassification) => void;
  confidenceThreshold: number;
  highRiskThreshold: number;
}

export const ManualReviewQueue: React.FC<ManualReviewQueueProps> = ({
  documents,
  onSelectDocument,
  onOpenReviewDrawer,
  confidenceThreshold,
  highRiskThreshold
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [riskTierFilter, setRiskTierFilter] = useState<RiskTier | 'ALL'>('ALL');

  const filteredDocs = documents.filter((doc) => {
    const effectiveTier = doc.auditReview.overriddenRiskTier || doc.riskTier;

    if (riskTierFilter !== 'ALL' && effectiveTier !== riskTierFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = doc.documentTitle.toLowerCase().includes(q);
      const matchCategory = doc.primaryCategory.toLowerCase().includes(q) || doc.primaryCategory.replace(/_/g, ' ').toLowerCase().includes(q);
      const matchContent = doc.cleanedText.toLowerCase().includes(q) || doc.rawText.toLowerCase().includes(q);
      const matchClauses = doc.clauses.some((c) => c.originalText.toLowerCase().includes(q) || c.clauseTitle.toLowerCase().includes(q));

      if (!matchTitle && !matchCategory && !matchContent && !matchClauses) {
        return false;
      }
    }

    if (statusFilter === 'ALL_FLAGGED') return doc.isFlaggedForManualReview;
    if (statusFilter === 'PENDING') return doc.auditReview.status === 'PENDING_REVIEW';
    if (statusFilter === 'REVIEWED') return ['APPROVED', 'APPROVED_WITH_MODIFICATION', 'REJECTED', 'OVERRIDDEN'].includes(doc.auditReview.status);
    if (statusFilter === 'OVERRIDDEN') return Boolean(doc.auditReview.overriddenRiskTier);
    if (statusFilter === 'ALL') return true;
    return true;
  });

  const pendingCount = documents.filter((d) => d.auditReview.status === 'PENDING_REVIEW').length;
  const overriddenCount = documents.filter((d) => Boolean(d.auditReview.overriddenRiskTier)).length;
  const approvedCount = documents.filter((d) => d.auditReview.status === 'APPROVED' || d.auditReview.status === 'APPROVED_WITH_MODIFICATION').length;

  const getRiskColor = (tier: RiskTier) => {
    switch (tier) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950/60 border-rose-800 text-rose-300',
          dot: 'bg-rose-500',
          badge: 'bg-rose-500 text-white'
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-950/60 border-orange-800 text-orange-300',
          dot: 'bg-orange-500',
          badge: 'bg-orange-500 text-black'
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-950/60 border-amber-800 text-amber-300',
          dot: 'bg-amber-400',
          badge: 'bg-amber-400 text-black'
        };
      case 'LOW':
        return {
          bg: 'bg-lime-950/60 border-lime-800 text-lime-300',
          dot: 'bg-lime-400',
          badge: 'bg-[#a3e635] text-black font-bold'
        };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Profile / Queue Status Card (Matches Right Screen in Image) */}
      <div className="bg-[#121812] border border-[#232f23] rounded-3xl p-6 sm:p-7 shadow-xl text-center space-y-4">
        
        {/* Auditor Profile Avatar */}
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-tr from-lime-400 to-emerald-600 p-0.5 shadow-[0_0_20px_rgba(163,230,53,0.3)]">
          <div className="w-full h-full rounded-full bg-[#111711] flex items-center justify-center text-lime-400 font-bold text-xl">
            <UserCheck className="w-8 h-8" />
          </div>
        </div>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Manual Review &amp; Triage Governance
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Contracts with confidence &lt; {confidenceThreshold}% or risk &ge; {highRiskThreshold}/100 route here for compliance sign-off
          </p>
        </div>

        {/* Status Filter Pills (Matches "Events", "Favorite", "Archive" in Image) */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pt-1">
          {[
            { id: 'PENDING', label: `Pending Review (${pendingCount})` },
            { id: 'REVIEWED', label: `Resolved (${approvedCount})` },
            { id: 'OVERRIDDEN', label: `Overrides (${overriddenCount})` },
            { id: 'ALL', label: `All Documents (${documents.length})` }
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]'
                    : 'bg-[#182218] hover:bg-[#202c20] text-slate-300 border border-[#2a382a]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search by title, category, or content keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-8 py-2 bg-[#121812] border border-[#232f23] rounded-2xl text-white text-xs focus:outline-none focus:border-lime-500 font-medium placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white p-0.5 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Risk Tier Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((tier) => {
            const isSelected = riskTierFilter === tier;
            return (
              <button
                key={tier}
                onClick={() => setRiskTierFilter(tier)}
                className={`px-3 py-1.5 rounded-full font-semibold text-[11px] whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#a3e635] text-black shadow-sm font-bold'
                    : 'bg-[#121812] text-slate-400 hover:text-white border border-[#232f23]'
                }`}
              >
                {tier === 'ALL' ? 'All Tiers' : tier}
              </button>
            );
          })}
        </div>

      </div>

      {/* Contract Items List (Matches the list cards on the right screen of the image) */}
      <div className="space-y-3">
        {filteredDocs.length === 0 ? (
          <div className="bg-[#121812] border border-[#232f23] rounded-3xl p-8 text-center text-xs text-slate-400">
            No contracts match the current review criteria.
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const effectiveTier = doc.auditReview.overriddenRiskTier || doc.riskTier;
            const risk = getRiskColor(effectiveTier);

            return (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc)}
                className="bg-[#121812] hover:bg-[#182218] border border-[#232f23] hover:border-lime-700/60 rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group shadow-sm"
              >
                {/* Left Thumbnail + Contract Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Square rounded thumbnail matching image */}
                  <div className="w-12 h-12 rounded-2xl bg-[#1c261c] border border-[#283728] flex items-center justify-center shrink-0 text-lime-400 font-bold group-hover:scale-105 transition-transform">
                    <ShieldAlert className="w-6 h-6 text-lime-400" />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white truncate group-hover:text-lime-300 transition-colors">
                        {doc.documentTitle}
                      </h3>
                      {doc.auditReview.overriddenRiskTier && (
                        <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
                          OVERRIDDEN
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>{doc.primaryCategory.replace(/_/g, ' ')}</span>
                      <span>·</span>
                      <span className="text-slate-500">{new Date(doc.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                    </div>

                    {searchQuery.trim() && (
                      <div className="text-[10px] text-lime-400/90 font-mono italic">
                        Matched keyword: "{searchQuery.trim()}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Badges & Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  
                  {/* Risk Badge (Matches the $40.00 / Free pill in image) */}
                  <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${risk.badge}`}>
                    {effectiveTier} · {doc.riskScore}
                  </div>

                  {/* Sign-Off / Inspect Action Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenReviewDrawer(doc);
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#1c261c] hover:bg-[#a3e635] text-slate-200 hover:text-black transition-all cursor-pointer border border-[#2e3e2e]"
                  >
                    Review
                  </button>

                  <div className="w-8 h-8 rounded-full bg-[#1c261c] flex items-center justify-center text-slate-400 group-hover:bg-[#a3e635] group-hover:text-black transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
