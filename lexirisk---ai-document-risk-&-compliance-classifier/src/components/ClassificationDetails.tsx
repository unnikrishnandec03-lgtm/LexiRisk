import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileCheck,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  Filter,
  ArrowRight,
  BookOpen,
  Scale,
  Sparkles,
  FileDown,
  User,
  Users,
  CheckSquare
} from 'lucide-react';
import { ComplianceCategory, DocumentClassification, ExtractedClause, RiskTier } from '../types';
import { ExplainabilityInspector } from './ExplainabilityInspector';

interface ClassificationDetailsProps {
  document: DocumentClassification;
  onOpenCleanerDiff: () => void;
  onOpenReviewDrawer: () => void;
  confidenceThreshold: number;
  highRiskThreshold: number;
  onExportPdf?: () => void;
}

export const ClassificationDetails: React.FC<ClassificationDetailsProps> = ({
  document,
  onOpenCleanerDiff,
  onOpenReviewDrawer,
  confidenceThreshold,
  highRiskThreshold,
  onExportPdf
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'story' | 'clauses' | 'explainability' | 'precedents'>('story');
  const [expandedClauseId, setExpandedClauseId] = useState<string | null>(
    document.clauses[0]?.id || null
  );

  const getRiskChipColor = (tier: RiskTier) => {
    switch (tier) {
      case 'CRITICAL':
        return 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]';
      case 'HIGH':
        return 'bg-orange-500 text-black shadow-[0_0_15px_rgba(249,115,22,0.4)]';
      case 'MEDIUM':
        return 'bg-amber-400 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]';
      case 'LOW':
        return 'bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.4)]';
    }
  };

  const isConfidenceLow = document.confidenceScore < confidenceThreshold;
  const isScoreHigh = document.riskScore >= highRiskThreshold;
  const effectiveTier = document.auditReview.overriddenRiskTier || document.riskTier;

  // Subtle color-coded border transition & glow based on confidence score (fluorescent lime for high, warning amber for low)
  const mainCardBorderClasses = isConfidenceLow
    ? 'border-amber-500/50 hover:border-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.14)]'
    : 'border-[#a3e635]/40 hover:border-[#a3e635]/70 shadow-[0_0_35px_rgba(163,230,53,0.12)]';

  const heroCardClasses = isConfidenceLow
    ? 'border-amber-500/30 from-[#221a10] to-[#15110d]'
    : 'border-[#283728] from-[#182318] to-[#121912]';

  const ambientGlowClass = isConfidenceLow
    ? 'bg-amber-500/12'
    : 'bg-lime-500/12';

  return (
    <div
      className={`bg-[#121812] border rounded-3xl p-5 sm:p-7 space-y-6 transition-all duration-500 ease-in-out ${mainCardBorderClasses}`}
    >
      
      {/* Top Hero Section (Matches Center Screen in Image) */}
      <div
        className={`relative rounded-2xl bg-gradient-to-b border p-6 sm:p-7 space-y-4 overflow-hidden transition-all duration-500 ease-in-out ${heroCardClasses}`}
      >
        
        {/* Ambient background glow with smooth color transition */}
        <div
          className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-colors duration-500 ease-in-out ${ambientGlowClass}`}
        />

        {/* Top Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            {/* Bright Pill Price/Risk Badge (Exactly like $40.00 badge in image) */}
            <span className={`px-3.5 py-1 rounded-full text-xs font-mono font-extrabold tracking-wide ${getRiskChipColor(effectiveTier)}`}>
              {effectiveTier} RISK · {document.riskScore}/100
            </span>

            {/* Certainty badge with confidence color coding */}
            <span
              className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 transition-colors duration-500 ${
                isConfidenceLow
                  ? 'text-amber-300 bg-amber-950/70 border-amber-800/60'
                  : 'text-lime-400 bg-lime-950/60 border-lime-800/40'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConfidenceLow ? 'bg-amber-400 animate-ping' : 'bg-[#a3e635] animate-pulse'
                }`}
              />
              <span>
                {document.confidenceScore}% Certainty {isConfidenceLow ? `(Low <${confidenceThreshold}%)` : '(High)'}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onExportPdf && (
              <button
                onClick={onExportPdf}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1e2a1e] hover:bg-[#253525] border border-[#344634] text-white transition-colors cursor-pointer"
                title="Export PDF Summary"
              >
                <FileDown className="w-3.5 h-3.5 text-lime-400" />
                <span>Export PDF</span>
              </button>
            )}

            <button
              onClick={onOpenCleanerDiff}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#1e2a1e] hover:bg-[#253525] border border-[#344634] text-slate-300 transition-colors cursor-pointer"
              title="View text cleaner normalization diff"
            >
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              <span>Cleaned Text</span>
            </button>
          </div>
        </div>

        {/* Big Bold Contract Title */}
        <div className="space-y-1 relative z-10">
          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug">
            {document.documentTitle}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono pt-1">
            <span className="flex items-center gap-1 text-lime-400">
              <Clock className="w-3.5 h-3.5" />
              {new Date(document.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span>·</span>
            <span className="text-slate-300">{document.primaryCategory.replace(/_/g, ' ')}</span>
            <span>·</span>
            <span>{document.documentType}</span>
          </div>
        </div>

        {/* Assigned Auditor / Lead Counsel Strip (Matches Andrew Ainsley profile card in image) */}
        <div className="p-3 rounded-2xl bg-[#0e140e]/90 border border-[#232f23] flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-lime-400/20 border border-lime-500/40 flex items-center justify-center text-lime-400 font-bold text-xs">
              {document.auditReview.reviewerName ? document.auditReview.reviewerName.charAt(0) : 'A'}
            </div>
            <div>
              <div className="text-xs font-bold text-white leading-tight">
                {document.auditReview.reviewerName || 'Senior Compliance Counsel'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Corporate Governance &amp; Risk Reviewer
              </div>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
            document.auditReview.status === 'PENDING_REVIEW'
              ? 'bg-rose-950/60 text-rose-300 border-rose-800'
              : 'bg-lime-950/60 text-lime-300 border-lime-800'
          }`}>
            {document.auditReview.status.replace(/_/g, ' ')}
          </span>
        </div>

      </div>

      {/* Segmented Sub-Tabs (Matches "Our Story", "Order of the day", "Dining" in image) */}
      <div className="flex items-center gap-2 border-b border-[#232f23] pb-2 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveSubTab('story')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'story'
              ? 'bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]'
              : 'text-slate-400 hover:text-white bg-[#101710] border border-[#202c20]'
          }`}
        >
          Audit Story &amp; Summary
        </button>

        <button
          onClick={() => setActiveSubTab('clauses')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'clauses'
              ? 'bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]'
              : 'text-slate-400 hover:text-white bg-[#101710] border border-[#202c20]'
          }`}
        >
          High-Risk Clauses ({document.clauses.length})
        </button>

        <button
          onClick={() => setActiveSubTab('explainability')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'explainability'
              ? 'bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]'
              : 'text-slate-400 hover:text-white bg-[#101710] border border-[#202c20]'
          }`}
        >
          Explainability (TF-IDF)
        </button>

        <button
          onClick={() => setActiveSubTab('precedents')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeSubTab === 'precedents'
              ? 'bg-[#a3e635] text-black shadow-[0_0_15px_rgba(163,230,53,0.3)]'
              : 'text-slate-400 hover:text-white bg-[#101710] border border-[#202c20]'
          }`}
        >
          Precedents ({document.nearestPrecedents.length})
        </button>
      </div>

      {/* Tab 1: Audit Story & Executive Summary */}
      {activeSubTab === 'story' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0d130d] border border-[#232f23] space-y-2">
            <h3 className="text-xs font-bold text-lime-400 tracking-wide uppercase font-mono">
              Executive Compliance Rationale
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {document.executiveSummary}
            </p>
          </div>

          {/* Trigger Flags if present */}
          {document.flagReasons.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold font-mono">
                <AlertTriangle className="w-4 h-4" />
                <span>Governance Escalation Triggers:</span>
              </div>
              <ul className="list-disc list-inside text-xs text-rose-200/90 space-y-1 font-mono">
                {document.flagReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: High-Risk Clauses */}
      {activeSubTab === 'clauses' && (
        <div className="space-y-3">
          {document.clauses.map((clause) => {
            const isExpanded = expandedClauseId === clause.id;
            return (
              <div
                key={clause.id}
                className="rounded-2xl border border-[#232f23] bg-[#0d130d] overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedClauseId(isExpanded ? null : clause.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#131b13] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      clause.riskLevel === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : clause.riskLevel === 'HIGH'
                        ? 'bg-orange-950 text-orange-300 border border-orange-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {clause.riskLevel}
                    </span>
                    <span className="font-semibold text-xs text-white">{clause.clauseTitle}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500">
                      Lines {clause.startLine || 1}-{clause.endLine || 10}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 border-t border-[#232f23] space-y-3 text-xs bg-[#0b100b]">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">Contract Excerpt</span>
                      <blockquote className="p-3 rounded-xl bg-[#111711] border border-[#1e2a1e] font-mono text-xs text-slate-300 leading-relaxed italic">
                        "{clause.originalText}"
                      </blockquote>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-rose-400 block mb-1">Legal Risk Rationale</span>
                      <p className="text-slate-300 leading-relaxed">{clause.rationale}</p>
                    </div>

                    {clause.suggestedRemediation && (
                      <div>
                        <span className="text-[10px] font-mono uppercase text-lime-400 block mb-1">Recommended Counter-Proposal Redline</span>
                        <div className="p-3 rounded-xl bg-lime-950/20 border border-lime-900/40 font-mono text-xs text-lime-300 leading-relaxed">
                          {clause.suggestedRemediation}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Explainability & Saliency */}
      {activeSubTab === 'explainability' && (
        <div className="rounded-2xl bg-[#0d130d] border border-[#232f23] p-4">
          <ExplainabilityInspector
            saliencyTerms={document.saliencyTerms}
            documentText={document.cleanedText}
          />
        </div>
      )}

      {/* Tab 4: Precedents */}
      {activeSubTab === 'precedents' && (
        <div className="space-y-2.5">
          {document.nearestPrecedents.map((pm) => (
            <div key={pm.id} className="p-3.5 rounded-2xl bg-[#0d130d] border border-[#232f23] flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-white">{pm.title}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-lime-950 text-lime-400 border border-lime-800">
                    {Math.round(pm.similarityScore * 100)}% Match
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-1">Precedent Outcome: {pm.historicAuditOutcome.replace(/_/g, ' ')}</div>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase">{pm.id}</span>
            </div>
          ))}
        </div>
      )}

      {/* Member Strip & Sign-Off CTA (Exact match to middle screen in image) */}
      <div className="pt-4 border-t border-[#232f23] flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Member Avatars Overlapping */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-lime-400 text-black font-bold text-xs flex items-center justify-center border-2 border-[#121812]">
              SJ
            </div>
            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center border-2 border-[#121812]">
              AA
            </div>
            <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center border-2 border-[#121812]">
              MK
            </div>
            <div className="w-8 h-8 rounded-full bg-[#1e2a1e] text-lime-400 font-mono font-bold text-[10px] flex items-center justify-center border-2 border-[#121812]">
              12+
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-white">Compliance Counsel Sign-Off</div>
            <div className="text-[10px] text-slate-400 font-mono">Immutable audit logging</div>
          </div>
        </div>

        {/* Big Neon Lime Action Button (Matches "Enroll Now" in image) */}
        <button
          onClick={onOpenReviewDrawer}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#a3e635] hover:bg-[#bef264] text-black font-bold text-xs shadow-[0_0_20px_rgba(163,230,53,0.35)] transition-all cursor-pointer"
        >
          <CheckSquare className="w-4 h-4" />
          <span>Review &amp; Sign-Off</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

      </div>

    </div>
  );
};
