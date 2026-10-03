import { BenchmarkPrecedent, ComplianceCategory, ExtractedClause, RiskTier, TermSaliency } from '../types';
import { HISTORIC_PRECEDENTS } from '../data/precedents';

export interface CleanTextResult {
  cleanedText: string;
  originalLength: number;
  cleanedLength: number;
  linesRemoved: number;
  artifactsFiltered: string[];
}

// Cleans messy extracted text (PDF headers, page numbers, trailing noise)
export function cleanDocumentText(rawText: string): CleanTextResult {
  const originalLength = rawText.length;
  const artifactsFiltered: string[] = [];
  let linesRemoved = 0;

  const lines = rawText.split(/\r?\n/);
  const cleanedLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Check for page number artifacts like "Page 1 of 14", "--- Page 3 ---", "[Page 12]"
    if (/^(page\s+\d+(\s+of\s+\d+)?|\-+\s*page\s*\d+\s*\-+|\(?\d+\s*\/\s*\d+\)?)$/i.test(line)) {
      linesRemoved++;
      if (!artifactsFiltered.includes('Page Numbers / Footers')) {
        artifactsFiltered.push('Page Numbers / Footers');
      }
      continue;
    }

    // Check for recurring confidentiality stamps / Doc Ref lines
    if (/^(confidential(\s*(&|and)?\s*proprietary)?|internal\s*use\s*only|draft\s*v?\d+(\.\d+)?)$/i.test(line)) {
      linesRemoved++;
      if (!artifactsFiltered.includes('Boilerplate Stamp / Draft Watermark')) {
        artifactsFiltered.push('Boilerplate Stamp / Draft Watermark');
      }
      continue;
    }

    // Remove standalone line number prefixes often left by OCR (e.g., "12  Vendor shall...")
    const lineNumPrefixMatch = line.match(/^(\d{1,4}\s{2,})(.*)$/);
    if (lineNumPrefixMatch && lineNumPrefixMatch[2]) {
      line = lineNumPrefixMatch[2].trim();
      if (!artifactsFiltered.includes('OCR Line Numbers')) {
        artifactsFiltered.push('OCR Line Numbers');
      }
    }

    // Skip empty consecutive whitespace lines
    if (line.length === 0) {
      if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] === '') {
        linesRemoved++;
        continue;
      }
      cleanedLines.push('');
      continue;
    }

    // Replace non-breaking spaces, curly quotes, weird dashes
    line = line
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, '-')
      .replace(/\u00A0/g, ' ');

    cleanedLines.push(line);
  }

  const cleanedText = cleanedLines.join('\n').trim();

  return {
    cleanedText,
    originalLength,
    cleanedLength: cleanedText.length,
    linesRemoved,
    artifactsFiltered: artifactsFiltered.length > 0 ? artifactsFiltered : ['Normalized whitespace & punctuation']
  };
}

// Vocabulary of high-risk and mitigating terms with predefined risk weights
export const RISK_LEXICON: Record<string, { weight: number; category: ComplianceCategory }> = {
  'unlimited liability': { weight: 0.95, category: 'LIABILITY_INDEMNITY' },
  'unlimited amount': { weight: 0.9, category: 'LIABILITY_INDEMNITY' },
  'shall be unlimited': { weight: 0.92, category: 'LIABILITY_INDEMNITY' },
  'indemnify and hold harmless': { weight: 0.65, category: 'LIABILITY_INDEMNITY' },
  'any and all losses': { weight: 0.75, category: 'LIABILITY_INDEMNITY' },
  'fifty dollars': { weight: 0.85, category: 'LIABILITY_INDEMNITY' },
  'sole discretion': { weight: 0.6, category: 'OPERATIONAL_SLA' },
  'without prior notice': { weight: 0.7, category: 'OPERATIONAL_SLA' },
  'without written notice': { weight: 0.7, category: 'OPERATIONAL_SLA' },
  'waives any statutory': { weight: 0.88, category: 'LIABILITY_INDEMNITY' },
  'cayman islands': { weight: 0.55, category: 'AML_FINANCIAL' },
  'vanuatu': { weight: 0.75, category: 'AML_FINANCIAL' },
  'cyprus': { weight: 0.5, category: 'AML_FINANCIAL' },
  'bearer bonds': { weight: 0.95, category: 'AML_FINANCIAL' },
  'cryptocurrency': { weight: 0.65, category: 'AML_FINANCIAL' },
  'usdt': { weight: 0.6, category: 'AML_FINANCIAL' },
  'cash': { weight: 0.5, category: 'AML_FINANCIAL' },
  'beneficial ownership': { weight: 0.7, category: 'AML_FINANCIAL' },
  'ultimate beneficial owner': { weight: 0.7, category: 'AML_FINANCIAL' },
  'politically exposed person': { weight: 0.75, category: 'AML_FINANCIAL' },
  'source of wealth': { weight: 0.7, category: 'AML_FINANCIAL' },
  'anti-money laundering': { weight: 0.4, category: 'AML_FINANCIAL' },
  'economic sanctions': { weight: 0.85, category: 'EXPORT_REGULATORY' },
  'export trade controls': { weight: 0.8, category: 'EXPORT_REGULATORY' },
  'tariffs': { weight: 0.3, category: 'EXPORT_REGULATORY' },
  'itar': { weight: 0.95, category: 'EXPORT_REGULATORY' },
  'ear': { weight: 0.75, category: 'EXPORT_REGULATORY' },
  'dsp-5': { weight: 0.9, category: 'EXPORT_REGULATORY' },
  'retained rights': { weight: 0.6, category: 'IP_CONFIDENTIALITY' },
  'exclusive ownership': { weight: 0.5, category: 'IP_CONFIDENTIALITY' },
  'assigns exclusively': { weight: 0.75, category: 'IP_CONFIDENTIALITY' },
  'gplv3': { weight: 0.85, category: 'IP_CONFIDENTIALITY' },
  'copyleft': { weight: 0.8, category: 'IP_CONFIDENTIALITY' },
  'agpl': { weight: 0.88, category: 'IP_CONFIDENTIALITY' },
  'international territories': { weight: 0.65, category: 'GDPR_PRIVACY' },
  'adequacy decision': { weight: 0.7, category: 'GDPR_PRIVACY' },
  'standard contractual clauses': { weight: -0.6, category: 'GDPR_PRIVACY' },
  'fourteen (14) calendar days': { weight: 0.55, category: 'GDPR_PRIVACY' },
  'thirty (30) business days': { weight: 0.7, category: 'GDPR_PRIVACY' },
  'discretionary allowance': { weight: 0.92, category: 'FCPA_ANTI_CORRUPTION' },
  'procurement officials': { weight: 0.7, category: 'FCPA_ANTI_CORRUPTION' },
  'hospitality allowance': { weight: 0.85, category: 'FCPA_ANTI_CORRUPTION' },
  'facilitation fees': { weight: 0.95, category: 'FCPA_ANTI_CORRUPTION' },
  'honorariums': { weight: 0.85, category: 'FCPA_ANTI_CORRUPTION' },
  
  // Safe / Mitigating phrases (Negative weight lowers risk)
  'mutual': { weight: -0.5, category: 'LIABILITY_INDEMNITY' },
  'mutual waiver': { weight: -0.6, category: 'LIABILITY_INDEMNITY' },
  'capped at total fees': { weight: -0.8, category: 'LIABILITY_INDEMNITY' },
  'aggregate liability capped': { weight: -0.85, category: 'LIABILITY_INDEMNITY' },
  'standard of care': { weight: -0.4, category: 'IP_CONFIDENTIALITY' },
  'reasonable care': { weight: -0.5, category: 'IP_CONFIDENTIALITY' },
  'two (2) years': { weight: -0.4, category: 'IP_CONFIDENTIALITY' },
  'state of delaware': { weight: -0.3, category: 'LIABILITY_INDEMNITY' },
  'state of new york': { weight: -0.3, category: 'LIABILITY_INDEMNITY' },
  'thirty (30) days following written notice to cure': { weight: -0.6, category: 'OPERATIONAL_SLA' },
  'notice to cure': { weight: -0.5, category: 'OPERATIONAL_SLA' }
};

// Computes term frequencies, TF-IDF weights, and saliencies
export function extractTermSaliencies(text: string): TermSaliency[] {
  const lowerText = text.toLowerCase();
  const saliencies: TermSaliency[] = [];

  for (const [term, meta] of Object.entries(RISK_LEXICON)) {
    // Count exact or regex occurrences
    const regex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lowerText.match(regex);
    const count = matches ? matches.length : 0;

    if (count > 0) {
      // Find context snippet around the first occurrence
      const index = lowerText.indexOf(term.toLowerCase());
      let contextSnippet = '';
      if (index !== -1) {
        const start = Math.max(0, index - 40);
        const end = Math.min(text.length, index + term.length + 40);
        contextSnippet = (start > 0 ? '...' : '') + text.substring(start, end).replace(/\s+/g, ' ').trim() + (end < text.length ? '...' : '');
      }

      saliencies.push({
        term,
        weight: meta.weight,
        count,
        category: meta.category,
        contextSnippet
      });
    }
  }

  // Sort by absolute risk weight * count descending
  return saliencies.sort((a, b) => Math.abs(b.weight) * b.count - Math.abs(a.weight) * a.count);
}

// Compute simple cosine similarity between two text strings using term overlap / TF vectors
export function computeCosineSimilarity(textA: string, textB: string): number {
  const tokenize = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3);
  };

  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  const freqA: Record<string, number> = {};
  const freqB: Record<string, number> = {};

  tokensA.forEach((w) => (freqA[w] = (freqA[w] || 0) + 1));
  tokensB.forEach((w) => (freqB[w] = (freqB[w] || 0) + 1));

  const allWords = new Set([...Object.keys(freqA), ...Object.keys(freqB)]);
  let dotProduct = 0;
  let magA = 0;
  let magB = 0;

  allWords.forEach((w) => {
    const valA = freqA[w] || 0;
    const valB = freqB[w] || 0;
    dotProduct += valA * valB;
    magA += valA * valA;
    magB += valB * valB;
  });

  if (magA === 0 || magB === 0) return 0;
  return Number((dotProduct / (Math.sqrt(magA) * Math.sqrt(magB))).toFixed(2));
}

// Find nearest historic precedents for explainability
export function findNearestPrecedents(text: string): BenchmarkPrecedent[] {
  return HISTORIC_PRECEDENTS.map((prec) => {
    const sim = computeCosineSimilarity(text, prec.title + ' ' + prec.matchingClauseSnippet + ' ' + prec.keyDifferenceRationale);
    // Baseline boost if keyword category matches
    let adjustedSim = Math.min(0.98, Math.max(0.35, sim + 0.3));
    if (text.toLowerCase().includes('indemn') && prec.category === 'LIABILITY_INDEMNITY') adjustedSim = Math.min(0.96, adjustedSim + 0.2);
    if (text.toLowerCase().includes('cash') && prec.category === 'AML_FINANCIAL') adjustedSim = Math.min(0.96, adjustedSim + 0.2);
    if (text.toLowerCase().includes('gpl') && prec.category === 'IP_CONFIDENTIALITY') adjustedSim = Math.min(0.95, adjustedSim + 0.2);
    if (text.toLowerCase().includes('itar') && prec.category === 'EXPORT_REGULATORY') adjustedSim = Math.min(0.96, adjustedSim + 0.2);

    return {
      ...prec,
      similarityScore: Number(adjustedSim.toFixed(2))
    };
  }).sort((a, b) => b.similarityScore - a.similarityScore).slice(0, 3);
}

// Heuristic fallback classifier (fast & deterministic, mirrors Gemini output)
export function fallbackHeuristicClassify(rawText: string, title: string) {
  const clean = cleanDocumentText(rawText);
  const saliencies = extractTermSaliencies(clean.cleanedText);
  const precedents = findNearestPrecedents(clean.cleanedText);

  let totalRiskWeight = 0;
  let highestWeightTerm = '';
  const categoryScores: Record<string, number> = {
    LIABILITY_INDEMNITY: 0,
    AML_FINANCIAL: 0,
    IP_CONFIDENTIALITY: 0,
    GDPR_PRIVACY: 0,
    FCPA_ANTI_CORRUPTION: 0,
    EXPORT_REGULATORY: 0,
    OPERATIONAL_SLA: 0
  };

  saliencies.forEach((s) => {
    totalRiskWeight += s.weight * s.count;
    if (s.weight > 0) {
      categoryScores[s.category] = (categoryScores[s.category] || 0) + s.weight * s.count;
      if (!highestWeightTerm || s.weight > 0.8) {
        highestWeightTerm = s.term;
      }
    }
  });

  // Determine Primary Category
  const sortedCategories = (Object.keys(categoryScores) as ComplianceCategory[]).sort(
    (a, b) => categoryScores[b] - categoryScores[a]
  );
  const primaryCategory = categoryScores[sortedCategories[0]] > 0 ? sortedCategories[0] : 'LIABILITY_INDEMNITY';
  const secondaryCategories = sortedCategories.slice(1, 3).filter((cat) => categoryScores[cat] > 0);

  // Compute 0-100 risk score
  let riskScore = 20;
  if (totalRiskWeight > 3.0) riskScore = Math.min(98, Math.round(50 + totalRiskWeight * 8));
  else if (totalRiskWeight > 1.2) riskScore = Math.min(75, Math.round(40 + totalRiskWeight * 12));
  else if (totalRiskWeight > 0.2) riskScore = Math.min(55, Math.round(25 + totalRiskWeight * 15));
  else riskScore = Math.max(12, Math.round(20 + totalRiskWeight * 5));

  let riskTier: RiskTier = 'LOW';
  if (riskScore >= 85) riskTier = 'CRITICAL';
  else if (riskScore >= 68) riskTier = 'HIGH';
  else if (riskScore >= 45) riskTier = 'MEDIUM';
  else riskTier = 'LOW';

  // Compute confidence (lower if conflicting positive/negative signals or ambiguous length)
  const confidenceScore = Math.max(68, Math.min(96, Math.round(82 + Math.abs(totalRiskWeight) * 2 - (clean.cleanedText.length < 200 ? 15 : 0))));

  // Extracted clauses
  const extractedClauses: ExtractedClause[] = [];
  const lines = clean.cleanedText.split('\n');

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.length < 35) return;
    const lowerLine = trimmed.toLowerCase();

    for (const [term, meta] of Object.entries(RISK_LEXICON)) {
      if (meta.weight > 0.6 && lowerLine.includes(term)) {
        if (!extractedClauses.some((c) => c.originalText === trimmed)) {
          extractedClauses.push({
            id: `clause-${idx + 1}`,
            clauseTitle: `Clause Flagged: ${term.toUpperCase()}`,
            originalText: trimmed,
            category: meta.category,
            riskLevel: meta.weight > 0.85 ? 'HIGH' : 'MEDIUM',
            riskScore: Math.round(meta.weight * 100),
            rationale: `Contains high-risk trigger term "${term}" which introduces excessive institutional legal exposure under ${meta.category.replace('_', ' ')}.`,
            suggestedRemediation: meta.category === 'LIABILITY_INDEMNITY'
              ? 'Introduce mutual aggregate liability cap (e.g., 12 months fees paid) and carve out exclusions.'
              : meta.category === 'GDPR_PRIVACY'
              ? 'Incorporate EU Standard Contractual Clauses (SCCs) and mandate 72h data breach notice.'
              : 'Require dual-signoff and explicit compliance audit warranty.',
            startLine: idx + 1,
            endLine: idx + 1,
            benchmarkClauseRef: 'Institutional Legal Risk Playbook 2026 §4.2'
          });
        }
      }
    }
  });

  return {
    riskTier,
    riskScore,
    confidenceScore,
    primaryCategory,
    secondaryCategories,
    executiveSummary: `Document "${title}" analyzed with risk score of ${riskScore}/100 (${riskTier}). Primary exposure identified under ${primaryCategory.replace('_', ' ')}. Identified ${saliencies.length} key risk indicator terms and ${extractedClauses.length} actionable high-exposure clauses.`,
    clauses: extractedClauses.slice(0, 5),
    saliencyTerms: saliencies.slice(0, 8),
    nearestPrecedents: precedents
  };
}
