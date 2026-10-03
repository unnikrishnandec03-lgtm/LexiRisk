export type RiskTier = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ComplianceCategory =
  | 'GDPR_PRIVACY'
  | 'AML_FINANCIAL'
  | 'IP_CONFIDENTIALITY'
  | 'LIABILITY_INDEMNITY'
  | 'FCPA_ANTI_CORRUPTION'
  | 'EXPORT_REGULATORY'
  | 'OPERATIONAL_SLA';

export interface ExtractedClause {
  id: string;
  clauseTitle: string;
  originalText: string;
  category: ComplianceCategory;
  riskLevel: RiskTier;
  riskScore: number; // 0-100
  rationale: string;
  suggestedRemediation: string;
  startLine?: number;
  endLine?: number;
  benchmarkClauseRef?: string;
}

export interface TermSaliency {
  term: string;
  weight: number; // -1.0 (strongly mitigates/reduces risk) to +1.0 (strongly elevates risk)
  count: number;
  category: string;
  contextSnippet?: string;
}

export interface BenchmarkPrecedent {
  id: string;
  title: string;
  category: ComplianceCategory;
  riskLevel: RiskTier;
  similarityScore: number; // 0 - 1.0 (cosine or semantic)
  historicAuditOutcome: 'REJECTED' | 'APPROVED_WITH_AMENDMENT' | 'APPROVED_UNCONDITIONAL';
  matchingClauseSnippet: string;
  keyDifferenceRationale: string;
}

export type ReviewStatus =
  | 'AUTO_CLEARED'
  | 'PENDING_REVIEW'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'APPROVED_WITH_MODIFICATION'
  | 'REJECTED'
  | 'OVERRIDDEN';

export interface AuditReview {
  status: ReviewStatus;
  reviewerName?: string;
  reviewerNotes?: string;
  reviewedAt?: string;
  overriddenRiskTier?: RiskTier;
  overrideReason?: string;
  actionItems?: string[];
}

export interface DocumentClassification {
  id: string;
  documentTitle: string;
  documentType: string;
  createdAt: string;
  rawText: string;
  cleanedText: string;
  cleanSummary: {
    originalLength: number;
    cleanedLength: number;
    linesRemoved: number;
    artifactsFiltered: string[];
  };
  
  // Classification output
  riskTier: RiskTier;
  riskScore: number; // 0-100
  confidenceScore: number; // 0-100
  primaryCategory: ComplianceCategory;
  secondaryCategories: ComplianceCategory[];
  executiveSummary: string;
  
  // Decision Flagging
  isFlaggedForManualReview: boolean;
  flagReasons: string[];
  
  // Explainability
  clauses: ExtractedClause[];
  saliencyTerms: TermSaliency[];
  nearestPrecedents: BenchmarkPrecedent[];
  
  // Review lifecycle
  auditReview: AuditReview;
}

export interface ThresholdSettings {
  confidenceThreshold: number; // e.g. 85: if confidence < threshold => flag
  highRiskScoreThreshold: number; // e.g. 70: if risk score >= threshold => flag
  autoFlagCategories: ComplianceCategory[];
  requireDualApprovalForCritical: boolean;
}

export interface ClassPerformance {
  category: RiskTier | ComplianceCategory;
  label: string;
  support: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  trueNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
}

export interface BenchmarkEvaluationDataset {
  id: string;
  title: string;
  groundTruthRisk: RiskTier;
  groundTruthCategory: ComplianceCategory;
  text: string;
  description: string;
}
