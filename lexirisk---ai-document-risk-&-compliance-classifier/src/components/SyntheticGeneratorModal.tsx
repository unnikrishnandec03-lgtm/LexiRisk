import React, { useState } from 'react';
import { X, Wand2, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { ComplianceCategory, RiskTier } from '../types';

interface SyntheticGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (text: string, title: string, category: ComplianceCategory) => void;
}

export const SyntheticGeneratorModal: React.FC<SyntheticGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerated
}) => {
  const [category, setCategory] = useState<ComplianceCategory>('GDPR_PRIVACY');
  const [riskTier, setRiskTier] = useState<RiskTier>('HIGH');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-synthetic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          riskTier,
          context: customPrompt || `A corporate commercial contract clause with explicit ${riskTier} risk indicators in ${category}.`
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate synthetic document');
      }

      const data = await res.json();
      if (!data.text) throw new Error('No text returned from generator');

      const generatedTitle = `Synthetic Test: ${category.replace('_', ' ')} (${riskTier} Risk)`;
      onGenerated(data.text, generatedTitle, category);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error generating synthetic document');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#121812] border border-[#232f23] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#232f23] bg-[#0d130d]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-2xl bg-lime-950/80 text-lime-400 border border-lime-700/50 shadow-sm">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Generate Synthetic Test Agreement</h2>
              <p className="text-xs text-slate-400">Stress-test classifier against specific compliance edge cases</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          
          <div>
            <label htmlFor="compliance-domain-select" className="font-semibold text-slate-300 block mb-1.5">
              Compliance Domain
            </label>
            <select
              id="compliance-domain-select"
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplianceCategory)}
              className="w-full px-3.5 py-2 bg-[#0c120c] border border-[#222e22] focus:border-lime-500 rounded-2xl text-white text-xs focus:outline-none font-medium"
            >
              <option value="GDPR_PRIVACY">GDPR &amp; Cross-Border Data Transfers</option>
              <option value="AML_FINANCIAL">Anti-Money Laundering (AML) &amp; Sanctions</option>
              <option value="IP_CONFIDENTIALITY">Intellectual Property &amp; Trade Secrets</option>
              <option value="LIABILITY_INDEMNITY">Unlimited Liability &amp; Uncapped Indemnity</option>
              <option value="FCPA_ANTI_CORRUPTION">FCPA &amp; Foreign Corrupt Practices</option>
              <option value="EXPORT_REGULATORY">ITAR / EAR Defense Trade Controls</option>
              <option value="OPERATIONAL_SLA">Operational SLAs &amp; Service Credits</option>
            </select>
          </div>

          <div>
            <label htmlFor="target-risk-tier-select" className="font-semibold text-slate-300 block mb-1.5">
              Target Risk Severity
            </label>
            <select
              id="target-risk-tier-select"
              value={riskTier}
              onChange={(e) => setRiskTier(e.target.value as RiskTier)}
              className="w-full px-3.5 py-2 bg-[#0c120c] border border-[#222e22] focus:border-lime-500 rounded-2xl text-white text-xs focus:outline-none font-medium"
            >
              <option value="LOW">LOW RISK (Standard, balanced, mutual caps)</option>
              <option value="MEDIUM">MEDIUM RISK (Minor ambiguities, asymmetrical caps)</option>
              <option value="HIGH">HIGH RISK (Uncapped liability, missing SCCs, GPL risk)</option>
              <option value="CRITICAL">CRITICAL RISK (Direct legal violation, cash facilitation, AML breach)</option>
            </select>
          </div>

          <div>
            <label htmlFor="custom-risk-scenario-text" className="font-semibold text-slate-300 block mb-1.5">
              Custom Scenario or Specific Clause (Optional)
            </label>
            <textarea
              id="custom-risk-scenario-text"
              rows={3}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Include a clause where a vendor demands 14-day notice for ransomware disclosure and excludes data loss from indemnification."
              className="w-full p-3 bg-[#0c120c] border border-[#222e22] focus:border-lime-500 rounded-2xl text-white text-xs focus:outline-none leading-relaxed font-mono"
            />
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

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
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-black bg-[#a3e635] hover:bg-[#bef264] disabled:bg-slate-800 disabled:text-slate-500 rounded-full shadow-[0_0_20px_rgba(163,230,53,0.35)] transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing Contract Excerpt...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Test Document</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
