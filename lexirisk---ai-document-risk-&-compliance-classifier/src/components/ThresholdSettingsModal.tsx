import React from 'react';
import { X, Sliders, AlertTriangle, ShieldCheck, Info } from 'lucide-react';
import { ComplianceCategory, ThresholdSettings } from '../types';

interface ThresholdSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholds: ThresholdSettings;
  onSave: (newThresholds: ThresholdSettings) => void;
}

const CATEGORY_LABELS: { key: ComplianceCategory; label: string }[] = [
  { key: 'GDPR_PRIVACY', label: 'GDPR & International Data Transfers' },
  { key: 'AML_FINANCIAL', label: 'Anti-Money Laundering (AML) & Sanctions' },
  { key: 'IP_CONFIDENTIALITY', label: 'IP Assignment & Trade Secrets' },
  { key: 'LIABILITY_INDEMNITY', label: 'Unlimited Liability & Indemnity' },
  { key: 'FCPA_ANTI_CORRUPTION', label: 'FCPA & Anti-Bribery Facilitation' },
  { key: 'EXPORT_REGULATORY', label: 'ITAR / EAR Export Controls' },
  { key: 'OPERATIONAL_SLA', label: 'Operational SLAs & Termination' }
];

export const ThresholdSettingsModal: React.FC<ThresholdSettingsModalProps> = ({
  isOpen,
  onClose,
  thresholds,
  onSave
}) => {
  const [local, setLocal] = React.useState<ThresholdSettings>(thresholds);

  React.useEffect(() => {
    setLocal(thresholds);
  }, [thresholds, isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (cat: ComplianceCategory) => {
    const exists = local.autoFlagCategories.includes(cat);
    setLocal({
      ...local,
      autoFlagCategories: exists
        ? local.autoFlagCategories.filter((c) => c !== cat)
        : [...local.autoFlagCategories, cat]
    });
  };

  const handleApply = () => {
    onSave(local);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#121812] border border-[#232f23] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232f23] bg-[#0d130d]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-2xl bg-lime-950/80 text-lime-400 border border-lime-700/50 shadow-sm">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Risk &amp; Confidence Threshold Configuration</h2>
              <p className="text-xs text-slate-400">Controls automated triage rules into the Manual Review Queue</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Rule 1: Confidence Threshold */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="conf-slider" className="font-semibold text-white">
                Confidence Floor Threshold
              </label>
              <span className="font-mono text-lime-400 text-sm font-bold bg-lime-950/80 px-2.5 py-0.5 rounded-full border border-lime-800/60">
                &lt; {local.confidenceThreshold}%
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Any document where AI classification confidence falls below this percentage is immediately quarantined into the <strong className="text-white">Manual Review Queue</strong> to prevent false negatives.
            </p>
            <input
              id="conf-slider"
              type="range"
              min="50"
              max="95"
              step="1"
              value={local.confidenceThreshold}
              onChange={(e) => setLocal({ ...local, confidenceThreshold: Number(e.target.value) })}
              className="w-full accent-[#a3e635] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>50% (Permissive)</span>
              <span>85% (Standard Baseline)</span>
              <span>95% (Strict Audit)</span>
            </div>
          </div>

          <div className="h-px bg-[#232f23]" />

          {/* Rule 2: High Risk Score Ceiling */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="risk-slider" className="font-semibold text-white">
                High Risk Escalation Score
              </label>
              <span className="font-mono text-rose-400 text-sm font-bold bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-800/60">
                &ge; {local.highRiskScoreThreshold} / 100
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Any document with a calculated composite risk score at or above this threshold triggers mandatory counsel sign-off before contract execution.
            </p>
            <input
              id="risk-slider"
              type="range"
              min="40"
              max="90"
              step="5"
              value={local.highRiskScoreThreshold}
              onChange={(e) => setLocal({ ...local, highRiskScoreThreshold: Number(e.target.value) })}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-mono">
              <span>40 (Conservative)</span>
              <span>70 (Institutional Standard)</span>
              <span>90 (Exceptions Only)</span>
            </div>
          </div>

          <div className="h-px bg-[#232f23]" />

          {/* Rule 3: Auto-Flag Policy Categories */}
          <div className="space-y-3">
            <div>
              <span className="font-bold text-white block">
                Zero-Tolerance Policy Categories (Always Flag for Review)
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Contracts triggering these policy classes will always route to counsel regardless of confidence score.
              </p>
            </div>

            <div className="space-y-1.5">
              {CATEGORY_LABELS.map((item) => {
                const checked = local.autoFlagCategories.includes(item.key);
                return (
                  <label
                    key={item.key}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors cursor-pointer ${
                      checked
                        ? 'bg-[#182618] border-[#a3e635] text-white shadow-sm'
                        : 'bg-[#0d130d] border-[#232f23] text-slate-400 hover:border-lime-900/60'
                    }`}
                  >
                    <span className="font-medium text-xs">{item.label}</span>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCategory(item.key)}
                      className="accent-[#a3e635] w-4 h-4 rounded cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Advisory banner */}
          <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-[#0e140e] border border-lime-800/40 text-lime-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-lime-400" />
            <div className="text-[11px] leading-relaxed">
              Threshold modifications take effect immediately across all newly audited documents and dynamically re-calculate triage filters in the batch evaluation harness.
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
            onClick={handleApply}
            className="px-6 py-2.5 text-xs font-bold text-black bg-[#a3e635] hover:bg-[#bef264] rounded-full shadow-[0_0_20px_rgba(163,230,53,0.35)] transition-all cursor-pointer"
          >
            Save &amp; Apply Thresholds
          </button>
        </div>

      </div>
    </div>
  );
};
