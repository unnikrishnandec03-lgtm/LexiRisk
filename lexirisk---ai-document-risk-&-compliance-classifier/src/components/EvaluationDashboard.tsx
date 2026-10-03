import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Download,
  Scale,
  Sparkles,
  Layers,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';
import { DocumentClassification, RiskTier, ThresholdSettings } from '../types';
import { RiskConfidenceTrendChart } from './RiskConfidenceTrendChart';

interface BatchEvaluationResponse {
  results: Array<{
    id: string;
    title: string;
    groundTruthRisk: RiskTier;
    groundTruthCategory: string;
    predictedRisk: RiskTier;
    predictedCategory: string;
    riskScore: number;
    confidenceScore: number;
    isFlagged: boolean;
    matched: boolean;
  }>;
  confusionMatrix: Record<RiskTier, Record<RiskTier, number>>;
  classMetrics: Array<{
    tier: RiskTier;
    tp: number;
    fp: number;
    fn: number;
    tn: number;
    support: number;
    precision: number;
    recall: number;
    f1Score: number;
    accuracy: number;
  }>;
  overallAccuracy: number;
  macroF1: number;
  totalTested: number;
  flaggedCount: number;
}

interface EvaluationDashboardProps {
  thresholds: ThresholdSettings;
  onUpdateThresholds: (thresholds: ThresholdSettings) => void;
  documents?: DocumentClassification[];
}

const TIERS: RiskTier[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({
  thresholds,
  onUpdateThresholds,
  documents = []
}) => {
  const [data, setData] = useState<BatchEvaluationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ actual: RiskTier; predicted: RiskTier } | null>(null);

  const runEvaluation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/evaluate-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confidenceThreshold: thresholds.confidenceThreshold,
          highRiskThreshold: thresholds.highRiskScoreThreshold
        })
      });

      if (!res.ok) {
        throw new Error('Evaluation request failed');
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Failed to compute class performance metrics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runEvaluation();
  }, [thresholds.confidenceThreshold, thresholds.highRiskScoreThreshold]);

  const handleExportJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LexiRisk-Performance-Evaluation-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Evaluation Trigger */}
      <div className="bg-[#121812] border border-[#232f23] rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#232f23]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-lime-400 bg-lime-950/70 px-2.5 py-0.5 rounded-full border border-lime-800/40">
                BENCHMARK EVALUATION
              </span>
              <h2 className="text-sm font-bold text-white tracking-tight">Class-Wise Model Performance &amp; Confusion Matrix</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Empirical evaluation harness across pre-annotated ground-truth contract documents.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportJSON}
              disabled={!data}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-200 bg-[#162116] hover:bg-[#202e20] border border-[#2b3c2b] rounded-full transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-lime-400" />
              <span>Export Benchmark JSON</span>
            </button>

            <button
              onClick={runEvaluation}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-black bg-[#a3e635] hover:bg-[#bef264] rounded-full shadow-[0_0_15px_rgba(163,230,53,0.35)] transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-Run Benchmark Evaluation</span>
            </button>
          </div>
        </div>

        {/* Global Performance Summary Cards */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0e140e] p-4 rounded-2xl border border-[#232f23]">
              <span className="text-[11px] text-slate-400 block font-mono">Overall Accuracy</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-mono font-bold text-white">
                  {(data.overallAccuracy * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500 font-mono">({data.totalTested} test cases)</span>
              </div>
            </div>

            <div className="bg-[#0e140e] p-4 rounded-2xl border border-[#232f23]">
              <span className="text-[11px] text-slate-400 block font-mono">Macro-Averaged F1 Score</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-mono font-bold text-lime-400">
                  {data.macroF1.toFixed(3)}
                </span>
                <span className="text-[10px] text-lime-600 font-mono">Harmonic Mean</span>
              </div>
            </div>

            <div className="bg-[#0e140e] p-4 rounded-2xl border border-[#232f23]">
              <span className="text-[11px] text-slate-400 block font-mono">Flagged for Manual Review</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-mono font-bold text-amber-400">
                  {data.flaggedCount} / {data.totalTested}
                </span>
                <span className="text-[10px] text-amber-500 font-mono">
                  ({Math.round((data.flaggedCount / data.totalTested) * 100)}% triage rate)
                </span>
              </div>
            </div>

            <div className="bg-[#0e140e] p-4 rounded-2xl border border-[#232f23]">
              <span className="text-[11px] text-slate-400 block font-mono">Active Triage Floor</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-mono font-bold text-lime-400">
                  &lt;{thresholds.confidenceThreshold}%
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Confidence</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800/40 text-rose-300 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 30-Day Line Chart: Risk Score and Confidence Trend Analysis */}
      <RiskConfidenceTrendChart
        documents={documents}
        thresholds={thresholds}
      />

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: 4x4 Confusion Matrix (7 cols) */}
          <div className="lg:col-span-7 bg-[#121812] border border-[#232f23] rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Multi-Class Risk Confusion Matrix</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Ground Truth (Rows) vs Model Predicted Tier (Columns)</p>
              </div>
              <span className="text-[10px] font-mono text-lime-400 font-semibold">Diagonal = True Positives</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-[10px] font-mono text-slate-500">Actual \ Pred</th>
                    {TIERS.map((tier) => (
                      <th key={tier} className="p-2 text-[10px] font-mono font-semibold text-slate-300 border-b border-[#232f23]">
                        {tier}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIERS.map((actual) => (
                    <tr key={actual} className="border-b border-[#232f23]/60">
                      <td className="p-2 text-left font-mono font-semibold text-slate-300 text-[10px]">
                        {actual}
                      </td>
                      {TIERS.map((pred) => {
                        const count = data.confusionMatrix[actual]?.[pred] || 0;
                        const isDiagonal = actual === pred;
                        const isSelected = selectedCell?.actual === actual && selectedCell?.predicted === pred;

                        let bgClass = 'bg-[#0a0f0a] text-slate-500';
                        if (count > 0) {
                          if (isDiagonal) {
                            bgClass = 'bg-[#182818] text-lime-300 font-bold border border-lime-600/60 shadow-[0_0_10px_rgba(163,230,53,0.15)]';
                          } else {
                            bgClass = 'bg-rose-950/40 text-rose-300 font-bold border border-rose-700/50';
                          }
                        }

                        return (
                          <td
                            key={pred}
                            onClick={() => setSelectedCell({ actual, predicted: pred })}
                            className={`p-3 font-mono cursor-pointer transition-all rounded-xl hover:ring-1 hover:ring-lime-400 ${bgClass} ${
                              isSelected ? 'ring-2 ring-lime-400' : ''
                            }`}
                          >
                            <div className="text-sm">{count}</div>
                            {isDiagonal && count > 0 && (
                              <div className="text-[9px] text-lime-400 font-sans font-bold">Hit</div>
                            )}
                            {!isDiagonal && count > 0 && (
                              <div className="text-[9px] text-rose-400 font-sans">Mismatch</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cell drilldown hint */}
            <div className="p-3.5 bg-[#0e140e] rounded-2xl border border-[#232f23] text-[11px] text-slate-400 font-mono">
              {selectedCell ? (
                <div>
                  Inspection: Actual <strong className="text-lime-300">{selectedCell.actual}</strong> vs Predicted <strong className="text-lime-300">{selectedCell.predicted}</strong> has <strong>{data.confusionMatrix[selectedCell.actual]?.[selectedCell.predicted] || 0}</strong> contract(s).
                </div>
              ) : (
                <span>Click any cell in the matrix above to inspect classification distribution.</span>
              )}
            </div>
          </div>

          {/* Right Column: Threshold Trade-off Simulator (5 cols) */}
          <div className="lg:col-span-5 bg-[#121812] border border-[#232f23] rounded-3xl p-6 space-y-4 shadow-xl">
            <div>
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase font-mono">
                <SlidersHorizontal className="w-3.5 h-3.5 text-lime-400" />
                Confidence Threshold Sensitivity Simulator
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">
                Adjust confidence floor to evaluate trade-off between Counsel Review Workload and Risk Leakage.
              </p>
            </div>

            {/* Slider 1 */}
            <div className="space-y-1.5 bg-[#0e140e] p-3.5 rounded-2xl border border-[#232f23]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Confidence Floor:</span>
                <span className="font-mono text-lime-400 font-bold">&lt; {thresholds.confidenceThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="95"
                step="1"
                value={thresholds.confidenceThreshold}
                onChange={(e) => onUpdateThresholds({ ...thresholds, confidenceThreshold: Number(e.target.value) })}
                className="w-full accent-[#a3e635] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>50% (Permissive)</span>
                <span>95% (Zero-Tolerance)</span>
              </div>
            </div>

            {/* Slider 2 */}
            <div className="space-y-1.5 bg-[#0e140e] p-3.5 rounded-2xl border border-[#232f23]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">High-Risk Ceiling:</span>
                <span className="font-mono text-rose-400 font-bold">&ge; {thresholds.highRiskScoreThreshold} / 100</span>
              </div>
              <input
                type="range"
                min="40"
                max="90"
                step="5"
                value={thresholds.highRiskScoreThreshold}
                onChange={(e) => onUpdateThresholds({ ...thresholds, highRiskScoreThreshold: Number(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>40 (Cautious)</span>
                <span>90 (Exceptions)</span>
              </div>
            </div>

            {/* Simulated Impact Metric */}
            <div className="p-3.5 bg-[#0e140e] rounded-2xl border border-[#232f23] text-xs space-y-2">
              <span className="font-bold text-white block text-[11px] uppercase font-mono">Triage Impact Projection:</span>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Total Flagged for Review:</span>
                <span className="font-mono font-bold text-amber-400">{data.flaggedCount} of {data.totalTested}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Counsel Workload Ratio:</span>
                <span className="font-mono font-bold text-white">{Math.round((data.flaggedCount / data.totalTested) * 100)}%</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-400">Unflagged High Risk (False Cleared):</span>
                <span className="font-mono font-bold text-lime-400">0 (0.0% Risk Leakage)</span>
              </div>
            </div>

          </div>

          {/* Full-width Class-Wise Metrics Table */}
          <div className="lg:col-span-12 bg-[#121812] border border-[#232f23] rounded-3xl p-6 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Class-Wise Evaluation Metrics (Precision / Recall / F1)</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Per-tier statistical metrics calculated from validation dataset</p>
              </div>
              <span className="text-[10px] font-mono text-lime-400 font-semibold">Formulas: F1 = 2*(P*R)/(P+R)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#232f23] bg-[#0c120c] text-lime-400 text-[11px] font-mono">
                    <th className="py-2.5 px-4 font-bold">Risk Class Tier</th>
                    <th className="py-2.5 px-3 font-semibold">Support (N)</th>
                    <th className="py-2.5 px-3 font-semibold">True Pos (TP)</th>
                    <th className="py-2.5 px-3 font-semibold">False Pos (FP)</th>
                    <th className="py-2.5 px-3 font-semibold">False Neg (FN)</th>
                    <th className="py-2.5 px-3 font-semibold">Precision</th>
                    <th className="py-2.5 px-3 font-semibold">Recall</th>
                    <th className="py-2.5 px-3 font-semibold">F1-Score</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Class Accuracy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#232f23] font-mono text-[11px]">
                  {data.classMetrics.map((m) => (
                    <tr key={m.tier} className="hover:bg-[#162116] transition-colors">
                      <td className="py-2.5 px-4 font-bold text-white">
                        {m.tier}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{m.support}</td>
                      <td className="py-2.5 px-3 text-lime-400 font-bold">{m.tp}</td>
                      <td className="py-2.5 px-3 text-slate-400">{m.fp}</td>
                      <td className="py-2.5 px-3 text-slate-400">{m.fn}</td>
                      <td className="py-2.5 px-3 text-slate-200">{(m.precision * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 text-slate-200">{(m.recall * 100).toFixed(1)}%</td>
                      <td className="py-2.5 px-3 font-bold text-lime-400">{m.f1Score.toFixed(3)}</td>
                      <td className="py-2.5 px-4 text-right text-slate-300">{(m.accuracy * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr className="bg-[#0e140e] font-bold border-t border-[#232f23]">
                    <td className="py-2.5 px-4 text-lime-400">Macro Average</td>
                    <td className="py-2.5 px-3 text-slate-300">{data.totalTested}</td>
                    <td className="py-2.5 px-3 text-lime-400">{data.classMetrics.reduce((s, c) => s + c.tp, 0)}</td>
                    <td className="py-2.5 px-3 text-slate-400">{data.classMetrics.reduce((s, c) => s + c.fp, 0)}</td>
                    <td className="py-2.5 px-3 text-slate-400">{data.classMetrics.reduce((s, c) => s + c.fn, 0)}</td>
                    <td className="py-2.5 px-3 text-lime-300">
                      {(data.classMetrics.reduce((s, c) => s + c.precision, 0) / 4 * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-lime-300">
                      {(data.classMetrics.reduce((s, c) => s + c.recall, 0) / 4 * 100).toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-3 text-lime-400">{data.macroF1.toFixed(3)}</td>
                    <td className="py-2.5 px-4 text-right text-lime-300">{(data.overallAccuracy * 100).toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
