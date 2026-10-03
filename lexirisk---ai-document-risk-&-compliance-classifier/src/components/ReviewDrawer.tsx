import React, { useState } from 'react';
import { X, CheckCircle, AlertTriangle, ShieldCheck, UserCheck, MessageSquare, History, Scale } from 'lucide-react';
import { DocumentClassification, ReviewStatus, RiskTier } from '../types';

interface ReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentClassification | null;
  onSaveReview: (
    docId: string,
    status: ReviewStatus,
    reviewerName: string,
    reviewerNotes: string,
    overriddenTier?: RiskTier,
    overrideReason?: string
  ) => void;
}

export const ReviewDrawer: React.FC<ReviewDrawerProps> = ({
  isOpen,
  onClose,
  document,
  onSaveReview
}) => {
  if (!isOpen || !document) return null;

  const [status, setStatus] = useState<ReviewStatus>(document.auditReview.status === 'PENDING_REVIEW' ? 'APPROVED_WITH_MODIFICATION' : document.auditReview.status);
  const [reviewerName, setReviewerName] = useState(document.auditReview.reviewerName || 'Senior Compliance Counsel');
  const [reviewerNotes, setReviewerNotes] = useState(document.auditReview.reviewerNotes || '');
  const [isOverriding, setIsOverriding] = useState(Boolean(document.auditReview.overriddenRiskTier));
  const [overriddenTier, setOverriddenTier] = useState<RiskTier>(document.auditReview.overriddenRiskTier || document.riskTier);
  const [overrideReason, setOverrideReason] = useState(document.auditReview.overrideReason || '');

  const handleSave = () => {
    onSaveReview(
      document.id,
      status,
      reviewerName,
      reviewerNotes,
      isOverriding ? overriddenTier : undefined,
      isOverriding ? overrideReason : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#121812] border-l border-[#232f23] w-full max-w-xl h-full flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#232f23] bg-[#0d130d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lime-950/80 text-lime-400 border border-lime-700/50 flex items-center justify-center shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Manual Compliance Review &amp; Sign-Off</h2>
              <p className="text-xs text-slate-400">Institutional audit adjudication &amp; override</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          
          {/* Document Reference Info */}
          <div className="p-4 rounded-2xl bg-[#0d130d] border border-[#232f23] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs truncate max-w-xs">{document.documentTitle}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-lime-950/80 text-lime-400 border border-lime-800/50 font-bold">
                {document.riskTier} RISK · {document.riskScore}/100
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span>{document.primaryCategory.replace(/_/g, ' ')}</span>
              <span>·</span>
              <span>Certainty: {document.confidenceScore}%</span>
            </div>
          </div>

          {/* Adjudication Status Picker */}
          <div className="space-y-2">
            <label className="font-bold text-slate-200 uppercase font-mono text-[11px] block">
              Adjudication Decision Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'APPROVED', label: 'Approve Unconditional', desc: 'Accept standard risk covenants' },
                { id: 'APPROVED_WITH_MODIFICATION', label: 'Approve With Redlines', desc: 'Requires recommended clause revisions' },
                { id: 'REJECTED', label: 'Reject / Terminate', desc: 'Statutory or unacceptable liability risk' },
                { id: 'IN_REVIEW', label: 'Escalate to Partner', desc: 'Requires second senior counsel audit' }
              ].map((item) => {
                const isSelected = status === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStatus(item.id as ReviewStatus)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#182618] border-[#a3e635] shadow-[0_0_15px_rgba(163,230,53,0.2)] ring-1 ring-[#a3e635]/40'
                        : 'bg-[#0d130d] border-[#232f23] text-slate-300 hover:bg-[#131b13]'
                    }`}
                  >
                    <span className={`text-xs font-bold ${isSelected ? 'text-lime-300' : 'text-white'}`}>
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1 leading-snug">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Risk Tier Override Section */}
          <div className="p-4 rounded-2xl bg-[#0d130d] border border-[#232f23] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-white text-xs block">Risk Tier Override</span>
                <span className="text-[10px] text-slate-400">Exercise human oversight to modify AI risk score</span>
              </div>
              <input
                type="checkbox"
                checked={isOverriding}
                onChange={(e) => setIsOverriding(e.target.checked)}
                className="w-4 h-4 accent-[#a3e635] rounded cursor-pointer"
              />
            </div>

            {isOverriding && (
              <div className="pt-2 border-t border-[#232f23] space-y-3">
                <div>
                  <label htmlFor="overridden-tier-select" className="text-slate-300 text-[11px] block font-semibold mb-1">
                    Overridden Risk Severity:
                  </label>
                  <select
                    id="overridden-tier-select"
                    value={overriddenTier}
                    onChange={(e) => setOverriddenTier(e.target.value as RiskTier)}
                    className="w-full px-3 py-2 bg-[#080d08] border border-[#232f23] rounded-2xl text-xs text-white focus:outline-none focus:border-lime-500 font-mono font-bold"
                  >
                    <option value="LOW">LOW RISK</option>
                    <option value="MEDIUM">MEDIUM RISK</option>
                    <option value="HIGH">HIGH RISK</option>
                    <option value="CRITICAL">CRITICAL RISK</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="override-justification-input" className="text-slate-300 text-[11px] block font-semibold mb-1">
                    Legal Justification for Override:
                  </label>
                  <input
                    id="override-justification-input"
                    type="text"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g. Existing parent guaranty covers subsidiary exposure; indemnity risk is fully offset."
                    className="w-full px-3 py-2 bg-[#080d08] border border-[#232f23] rounded-2xl text-xs text-white focus:outline-none focus:border-lime-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Reviewer Details */}
          <div className="space-y-3">
            <div>
              <label htmlFor="auditor-name-input" className="font-semibold text-slate-300 block mb-1">
                Auditor / Counsel Sign-Off Name
              </label>
              <input
                id="auditor-name-input"
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#0d130d] border border-[#232f23] rounded-2xl text-white text-xs focus:outline-none focus:border-lime-500 font-medium"
              />
            </div>

            <div>
              <label htmlFor="compliance-audit-notes" className="font-semibold text-slate-300 block mb-1">
                Compliance Review Notes &amp; Action Items
              </label>
              <textarea
                id="compliance-audit-notes"
                rows={4}
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Document specific required amendments, business sponsor concessions, or escrow mitigations..."
                className="w-full p-3 bg-[#0d130d] border border-[#232f23] rounded-2xl text-white text-xs focus:outline-none focus:border-lime-500 leading-relaxed font-mono"
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#232f23] bg-[#0d130d]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-black bg-[#a3e635] hover:bg-[#bef264] rounded-full shadow-[0_0_20px_rgba(163,230,53,0.35)] transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Complete Review &amp; Sign Off</span>
          </button>
        </div>

      </div>
    </div>
  );
};
