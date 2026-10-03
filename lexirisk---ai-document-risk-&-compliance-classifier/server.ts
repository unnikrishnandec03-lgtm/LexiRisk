import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { cleanDocumentText, extractTermSaliencies, findNearestPrecedents, fallbackHeuristicClassify } from './src/utils/textProcessor.ts';
import { BENCHMARK_EVALUATION_DATASET } from './src/data/sampleDocuments.ts';
import { ComplianceCategory, DocumentClassification, ExtractedClause, RiskTier } from './src/types.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Gemini client strictly per skill guidelines
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Core Document Classification Endpoint
app.post('/api/classify', async (req: Request, res: Response) => {
  try {
    const {
      text,
      title = 'Uploaded Document',
      documentType = 'Commercial Contract',
      confidenceThreshold = 85,
      highRiskThreshold = 70
    } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const cleanResult = cleanDocumentText(text);
    const localSaliencies = extractTermSaliencies(cleanResult.cleanedText);
    const nearestPrecedents = findNearestPrecedents(cleanResult.cleanedText);

    let classificationData: {
      riskTier: RiskTier;
      riskScore: number;
      confidenceScore: number;
      primaryCategory: ComplianceCategory;
      secondaryCategories: ComplianceCategory[];
      executiveSummary: string;
      clauses: ExtractedClause[];
    };

    if (ai) {
      try {
        const prompt = `You are an elite Senior Corporate Compliance Counsel and Legal Risk AI Auditor.
Analyze the following business document text to classify its risk and compliance exposure.

Document Title: "${title}"
Document Type: "${documentType}"

Text to analyze:
"""
${cleanResult.cleanedText.slice(0, 14000)}
"""

Classify the document into:
1. "riskTier": One of ["LOW", "MEDIUM", "HIGH", "CRITICAL"].
   - LOW: Standard boilerplate, mutual covenants, balanced caps, routine commercial transactions.
   - MEDIUM: Minor ambiguities, non-standard SLA calculations, 14-day data notice, modest liability imbalances.
   - HIGH: Unlimited liability, uncapped indemnities, unrestricted IP assignment, cross-border data transfer without SCCs, ITAR/EAR export license waivers.
   - CRITICAL: Direct legal/regulatory violation, criminal AML indicators (bearer bonds, non-KYC cash routing, undisclosed UBOs), bribery/FCPA facilitation payments.
2. "riskScore": integer from 0 to 100 representing overall risk severity.
3. "confidenceScore": integer from 0 to 100 representing your statistical confidence in this classification.
4. "primaryCategory": One of ["GDPR_PRIVACY", "AML_FINANCIAL", "IP_CONFIDENTIALITY", "LIABILITY_INDEMNITY", "FCPA_ANTI_CORRUPTION", "EXPORT_REGULATORY", "OPERATIONAL_SLA"].
5. "secondaryCategories": array of other relevant categories from the same list.
6. "executiveSummary": concise 2-3 sentence executive audit summary explaining the primary risk drivers.
7. "clauses": array of the most critical high-risk clauses extracted from the text (up to 5 clauses). For each clause include:
   - "clauseTitle": short descriptive title
   - "originalText": exact quotation from the text
   - "category": one of the category enums
   - "riskLevel": one of ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
   - "riskScore": 0-100
   - "rationale": legal analysis of why this clause is dangerous
   - "suggestedRemediation": actionable counter-proposal or amendment
   - "benchmarkClauseRef": relevant legal standard or playbook reference (e.g. "GDPR Art 28(3)(h)", "Market Standard Mutual Cap", "FCPA Guidelines")`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                riskTier: {
                  type: Type.STRING,
                  enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                  description: 'The overall risk tier of the document'
                },
                riskScore: {
                  type: Type.INTEGER,
                  description: 'Numerical risk score from 0 to 100'
                },
                confidenceScore: {
                  type: Type.INTEGER,
                  description: 'Confidence score from 0 to 100'
                },
                primaryCategory: {
                  type: Type.STRING,
                  enum: [
                    'GDPR_PRIVACY',
                    'AML_FINANCIAL',
                    'IP_CONFIDENTIALITY',
                    'LIABILITY_INDEMNITY',
                    'FCPA_ANTI_CORRUPTION',
                    'EXPORT_REGULATORY',
                    'OPERATIONAL_SLA'
                  ],
                  description: 'The primary compliance category'
                },
                secondaryCategories: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Secondary categories'
                },
                executiveSummary: {
                  type: Type.STRING,
                  description: 'Brief executive audit summary'
                },
                clauses: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      clauseTitle: { type: Type.STRING },
                      originalText: { type: Type.STRING },
                      category: { type: Type.STRING },
                      riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
                      riskScore: { type: Type.INTEGER },
                      rationale: { type: Type.STRING },
                      suggestedRemediation: { type: Type.STRING },
                      benchmarkClauseRef: { type: Type.STRING }
                    },
                    required: ['clauseTitle', 'originalText', 'category', 'riskLevel', 'riskScore', 'rationale', 'suggestedRemediation']
                  }
                }
              },
              required: ['riskTier', 'riskScore', 'confidenceScore', 'primaryCategory', 'executiveSummary', 'clauses']
            }
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        classificationData = {
          riskTier: (parsed.riskTier as RiskTier) || 'MEDIUM',
          riskScore: Math.min(100, Math.max(0, parsed.riskScore ?? 50)),
          confidenceScore: Math.min(100, Math.max(0, parsed.confidenceScore ?? 85)),
          primaryCategory: (parsed.primaryCategory as ComplianceCategory) || 'LIABILITY_INDEMNITY',
          secondaryCategories: (parsed.secondaryCategories as ComplianceCategory[]) || [],
          executiveSummary: parsed.executiveSummary || 'Document analyzed for compliance risk.',
          clauses: (parsed.clauses || []).map((c: any, i: number) => ({
            id: `gemini-clause-${i + 1}`,
            clauseTitle: c.clauseTitle || `Clause ${i + 1}`,
            originalText: c.originalText || '',
            category: (c.category as ComplianceCategory) || 'LIABILITY_INDEMNITY',
            riskLevel: (c.riskLevel as RiskTier) || 'MEDIUM',
            riskScore: c.riskScore ?? 50,
            rationale: c.rationale || '',
            suggestedRemediation: c.suggestedRemediation || '',
            benchmarkClauseRef: c.benchmarkClauseRef || 'Institutional Legal Risk Playbook 2026'
          }))
        };
      } catch (geminiError) {
        console.warn('Gemini classification fallback triggered:', geminiError);
        classificationData = fallbackHeuristicClassify(cleanResult.cleanedText, title);
      }
    } else {
      classificationData = fallbackHeuristicClassify(cleanResult.cleanedText, title);
    }

    // Step 5: Triage Rules & Confidence Thresholding
    const flagReasons: string[] = [];
    let isFlagged = false;

    if (classificationData.confidenceScore < confidenceThreshold) {
      isFlagged = true;
      flagReasons.push(`Confidence score (${classificationData.confidenceScore}%) is below governance threshold (${confidenceThreshold}%). Manual verification mandated.`);
    }

    if (classificationData.riskScore >= highRiskThreshold) {
      isFlagged = true;
      flagReasons.push(`High risk score (${classificationData.riskScore}/100) exceeds risk appetite ceiling (${highRiskThreshold}/100).`);
    }

    if (classificationData.riskTier === 'CRITICAL' || classificationData.riskTier === 'HIGH') {
      isFlagged = true;
      if (!flagReasons.some(r => r.includes('risk score'))) {
        flagReasons.push(`Classified in ${classificationData.riskTier} risk tier requiring senior counsel sign-off.`);
      }
    }

    const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const finalDoc: DocumentClassification = {
      id: docId,
      documentTitle: title,
      documentType,
      createdAt: new Date().toISOString(),
      rawText: text,
      cleanedText: cleanResult.cleanedText,
      cleanSummary: {
        originalLength: cleanResult.originalLength,
        cleanedLength: cleanResult.cleanedLength,
        linesRemoved: cleanResult.linesRemoved,
        artifactsFiltered: cleanResult.artifactsFiltered
      },
      riskTier: classificationData.riskTier,
      riskScore: classificationData.riskScore,
      confidenceScore: classificationData.confidenceScore,
      primaryCategory: classificationData.primaryCategory,
      secondaryCategories: classificationData.secondaryCategories,
      executiveSummary: classificationData.executiveSummary,
      isFlaggedForManualReview: isFlagged,
      flagReasons,
      clauses: classificationData.clauses,
      saliencyTerms: localSaliencies.slice(0, 10),
      nearestPrecedents,
      auditReview: {
        status: isFlagged ? 'PENDING_REVIEW' : 'AUTO_CLEARED'
      }
    };

    return res.json(finalDoc);
  } catch (err: any) {
    console.error('Classification error:', err);
    return res.status(500).json({ error: err.message || 'Internal classification error' });
  }
});

// 2. Benchmark Evaluation Harness Endpoint (Step 6)
app.post('/api/evaluate-batch', async (req: Request, res: Response) => {
  try {
    const { confidenceThreshold = 85, highRiskThreshold = 70 } = req.body;

    // Run evaluation against the 10 benchmark sample agreements
    const results = BENCHMARK_EVALUATION_DATASET.map((doc) => {
      const classification = fallbackHeuristicClassify(doc.text, doc.title);
      const isFlagged = classification.confidenceScore < confidenceThreshold || classification.riskScore >= highRiskThreshold || classification.riskTier === 'HIGH' || classification.riskTier === 'CRITICAL';

      return {
        id: doc.id,
        title: doc.title,
        groundTruthRisk: doc.groundTruthRisk,
        groundTruthCategory: doc.groundTruthCategory,
        predictedRisk: classification.riskTier,
        predictedCategory: classification.primaryCategory,
        riskScore: classification.riskScore,
        confidenceScore: classification.confidenceScore,
        isFlagged,
        matched: doc.groundTruthRisk === classification.riskTier
      };
    });

    // Compute 4x4 Confusion Matrix for Risk Tiers: LOW, MEDIUM, HIGH, CRITICAL
    const tiers: RiskTier[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    const confusionMatrix: Record<RiskTier, Record<RiskTier, number>> = {
      LOW: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      MEDIUM: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      HIGH: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
      CRITICAL: { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 }
    };

    results.forEach((r) => {
      if (confusionMatrix[r.groundTruthRisk] && confusionMatrix[r.groundTruthRisk][r.predictedRisk] !== undefined) {
        confusionMatrix[r.groundTruthRisk][r.predictedRisk]++;
      }
    });

    // Class-wise Precision, Recall, F1 for each risk tier
    const classMetrics = tiers.map((tier) => {
      const tp = confusionMatrix[tier][tier];
      const fn = tiers.reduce((acc, pred) => (pred !== tier ? acc + confusionMatrix[tier][pred] : acc), 0);
      const fp = tiers.reduce((acc, gt) => (gt !== tier ? acc + confusionMatrix[gt][tier] : acc), 0);
      const tn = results.length - (tp + fn + fp);

      const precision = tp + fp > 0 ? tp / (tp + fp) : 1;
      const recall = tp + fn > 0 ? tp / (tp + fn) : 1;
      const f1Score = precision + recall > 0 ? (2 * (precision * recall)) / (precision + recall) : 0;
      const support = tp + fn;

      return {
        tier,
        tp,
        fp,
        fn,
        tn,
        support,
        precision: Number(precision.toFixed(3)),
        recall: Number(recall.toFixed(3)),
        f1Score: Number(f1Score.toFixed(3)),
        accuracy: Number(((tp + tn) / results.length).toFixed(3))
      };
    });

    const totalTP = classMetrics.reduce((sum, m) => sum + m.tp, 0);
    const overallAccuracy = Number((totalTP / results.length).toFixed(3));
    const macroF1 = Number((classMetrics.reduce((sum, m) => sum + m.f1Score, 0) / tiers.length).toFixed(3));

    return res.json({
      results,
      confusionMatrix,
      classMetrics,
      overallAccuracy,
      macroF1,
      totalTested: results.length,
      flaggedCount: results.filter((r) => r.isFlagged).length
    });
  } catch (err: any) {
    console.error('Batch evaluation error:', err);
    return res.status(500).json({ error: err.message || 'Evaluation error' });
  }
});

// 3. Synthetic Document Generator Endpoint
app.post('/api/generate-synthetic', async (req: Request, res: Response) => {
  try {
    const { category = 'GDPR_PRIVACY', riskTier = 'HIGH', context = '' } = req.body;

    if (!ai) {
      return res.status(503).json({ error: 'Gemini AI engine is not configured with an API key.' });
    }

    const prompt = `Generate a realistic 4-paragraph excerpt of a business contract specifically tailored to demonstrate risk level: ${riskTier} in category: ${category}.
Context or specific elements to include: ${context || 'Realistic enterprise boilerplate with specific risky legal terms'}.
Do not include conversational preamble or markdown backticks; output only the clean contract text.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        temperature: 0.7
      }
    });

    return res.json({ text: response.text?.trim() || '' });
  } catch (err: any) {
    console.error('Synthetic generation error:', err);
    return res.status(500).json({ error: err.message || 'Generation error' });
  }
});

// Setup Vite or static serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
