import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DocumentIngestion } from './components/DocumentIngestion';
import { ClassificationDetails } from './components/ClassificationDetails';
import { ManualReviewQueue } from './components/ManualReviewQueue';
import { EvaluationDashboard } from './components/EvaluationDashboard';
import { CorpusLibrary } from './components/CorpusLibrary';
import { ThresholdSettingsModal } from './components/ThresholdSettingsModal';
import { CleanerDiffModal } from './components/CleanerDiffModal';
import { ReviewDrawer } from './components/ReviewDrawer';
import { SyntheticGeneratorModal } from './components/SyntheticGeneratorModal';
import { LoginModal } from './components/LoginModal';
import { LoginScreen } from './components/LoginScreen';
import { RecentActivityPanel } from './components/RecentActivityPanel';
import { WorkbenchSearchBar } from './components/WorkbenchSearchBar';
import { DocumentClassification, ReviewStatus, RiskTier, ThresholdSettings } from './types';
import { SAMPLE_DOCUMENTS, SampleDoc } from './data/sampleDocuments';
import { cleanDocumentText, extractTermSaliencies, fallbackHeuristicClassify, findNearestPrecedents } from './utils/textProcessor';
import { exportDocumentPdfSummary } from './utils/pdfGenerator';
import { useAuth } from './contexts/AuthContext';
import { saveDocumentToFirestore, loadUserDocumentsFromFirestore } from './utils/firestoreService';

const DEFAULT_THRESHOLDS: ThresholdSettings = {
  confidenceThreshold: 85,
  highRiskScoreThreshold: 70,
  autoFlagCategories: ['AML_FINANCIAL', 'FCPA_ANTI_CORRUPTION', 'EXPORT_REGULATORY'],
  requireDualApprovalForCritical: true
};

export default function App() {
  const { currentUser, userProfile, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'classifier' | 'review_queue' | 'evaluation' | 'corpus'>('classifier');
  const [thresholds, setThresholds] = useState<ThresholdSettings>(DEFAULT_THRESHOLDS);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<DocumentClassification | null>(null);
  const [allDocuments, setAllDocuments] = useState<DocumentClassification[]>([]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCleanerDiffOpen, setIsCleanerDiffOpen] = useState(false);
  const [isSyntheticOpen, setIsSyntheticOpen] = useState(false);
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [selectedReviewDoc, setSelectedReviewDoc] = useState<DocumentClassification | null>(null);

  // Initialize with pre-audited initial documents on mount
  useEffect(() => {
    const initialDocs: DocumentClassification[] = [
      // 1. Cloud MSA (High Risk)
      createInitialDoc(
        'doc-init-1',
        SAMPLE_DOCUMENTS[0].title,
        SAMPLE_DOCUMENTS[0].type,
        SAMPLE_DOCUMENTS[0].content,
        'HIGH',
        86,
        78, // Confidence < 85 -> flagged!
        'LIABILITY_INDEMNITY',
        ['GDPR_PRIVACY'],
        'Agreement contains unlimited third-party indemnification, a non-mutual $50 aggregate liability limitation, and permits unencrypted cross-border personal data transfers without Standard Contractual Clauses (SCCs).'
      ),
      // 2. Cross-border AML (Critical Risk)
      createInitialDoc(
        'doc-init-2',
        SAMPLE_DOCUMENTS[1].title,
        SAMPLE_DOCUMENTS[1].type,
        SAMPLE_DOCUMENTS[1].content,
        'CRITICAL',
        96,
        92,
        'AML_FINANCIAL',
        ['FCPA_ANTI_CORRUPTION', 'EXPORT_REGULATORY'],
        'Severe AML and financial crime compliance exposure. Features offshore nominee accounts in Cyprus/Vanuatu, payments in bearer bonds and cryptocurrency, and an explicit waiver of UBO identification and anti-corruption audit covenants.'
      ),
      // 3. Mutual NDA (Low Risk Clean)
      createInitialDoc(
        'doc-init-3',
        SAMPLE_DOCUMENTS[5].title,
        SAMPLE_DOCUMENTS[5].type,
        SAMPLE_DOCUMENTS[5].content,
        'LOW',
        18,
        94,
        'IP_CONFIDENTIALITY',
        [],
        'Market-standard mutual confidentiality agreement. Incorporates standard non-disclosure exceptions, standard 2-year survival term, and standard Delaware choice of law. Conforms with institutional risk baseline.'
      )
    ];

    setAllDocuments(initialDocs);
    setCurrentDoc(initialDocs[0]);
  }, []);

  // When user logs in, load persistent documents from Firestore
  useEffect(() => {
    if (currentUser?.uid) {
      loadUserDocumentsFromFirestore(currentUser.uid).then((savedDocs) => {
        if (savedDocs && savedDocs.length > 0) {
          setAllDocuments((prev) => {
            const existingIds = new Set(savedDocs.map((d) => d.id));
            const merged = [...savedDocs, ...prev.filter((d) => !existingIds.has(d.id))];
            return merged;
          });
          setCurrentDoc(savedDocs[0]);
        }
      });
    }
  }, [currentUser]);

  function createInitialDoc(
    id: string,
    title: string,
    type: string,
    rawText: string,
    riskTier: RiskTier,
    riskScore: number,
    confidenceScore: number,
    primaryCategory: any,
    secondaryCategories: any[],
    summary: string
  ): DocumentClassification {
    const clean = cleanDocumentText(rawText);
    const saliencies = extractTermSaliencies(clean.cleanedText);
    const precedents = findNearestPrecedents(clean.cleanedText);
    const isFlagged = confidenceScore < DEFAULT_THRESHOLDS.confidenceThreshold || riskScore >= DEFAULT_THRESHOLDS.highRiskScoreThreshold || riskTier === 'HIGH' || riskTier === 'CRITICAL';
    const flagReasons: string[] = [];

    if (confidenceScore < DEFAULT_THRESHOLDS.confidenceThreshold) {
      flagReasons.push(`Confidence score (${confidenceScore}%) is below floor threshold (${DEFAULT_THRESHOLDS.confidenceThreshold}%).`);
    }
    if (riskScore >= DEFAULT_THRESHOLDS.highRiskScoreThreshold) {
      flagReasons.push(`Risk score (${riskScore}/100) exceeds risk ceiling (${DEFAULT_THRESHOLDS.highRiskScoreThreshold}/100).`);
    }
    if (riskTier === 'CRITICAL' || riskTier === 'HIGH') {
      flagReasons.push(`${riskTier} risk tier mandates legal counsel sign-off.`);
    }

    const fallback = fallbackHeuristicClassify(clean.cleanedText, title);

    return {
      id,
      documentTitle: title,
      documentType: type,
      createdAt: new Date().toISOString(),
      rawText,
      cleanedText: clean.cleanedText,
      cleanSummary: {
        originalLength: clean.originalLength,
        cleanedLength: clean.cleanedLength,
        linesRemoved: clean.linesRemoved,
        artifactsFiltered: clean.artifactsFiltered
      },
      riskTier,
      riskScore,
      confidenceScore,
      primaryCategory,
      secondaryCategories,
      executiveSummary: summary,
      isFlaggedForManualReview: isFlagged,
      flagReasons,
      clauses: fallback.clauses,
      saliencyTerms: saliencies,
      nearestPrecedents: precedents,
      auditReview: {
        status: isFlagged ? 'PENDING_REVIEW' : 'AUTO_CLEARED'
      }
    };
  }

  // Classify a single document (either via backend Gemini proxy or client-side fallback)
  const classifySingleDocument = async (text: string, title: string, docType: string): Promise<DocumentClassification> => {
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          title,
          documentType: docType,
          confidenceThreshold: thresholds.confidenceThreshold,
          highRiskThreshold: thresholds.highRiskScoreThreshold
        })
      });

      if (!res.ok) {
        throw new Error('Classification request failed with status ' + res.status);
      }

      return await res.json();
    } catch (err: any) {
      console.warn('API error, executing client-side classification engine:', err);
      const clean = cleanDocumentText(text);
      const classification = fallbackHeuristicClassify(clean.cleanedText, title);
      const isFlagged =
        classification.confidenceScore < thresholds.confidenceThreshold ||
        classification.riskScore >= thresholds.highRiskScoreThreshold ||
        classification.riskTier === 'HIGH' ||
        classification.riskTier === 'CRITICAL';

      const flagReasons: string[] = [];
      if (classification.confidenceScore < thresholds.confidenceThreshold) {
        flagReasons.push(`Confidence score (${classification.confidenceScore}%) is below floor threshold (${thresholds.confidenceThreshold}%).`);
      }
      if (classification.riskScore >= thresholds.highRiskScoreThreshold) {
        flagReasons.push(`Risk score (${classification.riskScore}/100) exceeds risk ceiling (${thresholds.highRiskScoreThreshold}/100).`);
      }

      return {
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        documentTitle: title,
        documentType: docType,
        createdAt: new Date().toISOString(),
        rawText: text,
        cleanedText: clean.cleanedText,
        cleanSummary: {
          originalLength: clean.originalLength,
          cleanedLength: clean.cleanedLength,
          linesRemoved: clean.linesRemoved,
          artifactsFiltered: clean.artifactsFiltered
        },
        riskTier: classification.riskTier,
        riskScore: classification.riskScore,
        confidenceScore: classification.confidenceScore,
        primaryCategory: classification.primaryCategory,
        secondaryCategories: classification.secondaryCategories,
        executiveSummary: classification.executiveSummary,
        isFlaggedForManualReview: isFlagged,
        flagReasons,
        clauses: classification.clauses,
        saliencyTerms: classification.saliencyTerms,
        nearestPrecedents: classification.nearestPrecedents,
        auditReview: {
          status: isFlagged ? 'PENDING_REVIEW' : 'AUTO_CLEARED'
        }
      };
    }
  };

  // Handle single document analysis
  const handleAnalyzeDocument = async (text: string, title: string, docType: string) => {
    setIsAnalyzing(true);
    try {
      const doc = await classifySingleDocument(text, title, docType);
      setCurrentDoc(doc);
      setAllDocuments((prev) => [doc, ...prev]);

      if (currentUser?.uid) {
        saveDocumentToFirestore(currentUser.uid, doc);
      }
      setActiveTab('classifier');
      return doc;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle batch document analysis in parallel
  const handleAnalyzeBatch = async (
    items: { text: string; title: string; docType: string }[]
  ): Promise<DocumentClassification[]> => {
    setIsAnalyzing(true);
    try {
      // Process all documents in parallel
      const results = await Promise.all(
        items.map((item) => classifySingleDocument(item.text, item.title, item.docType))
      );

      if (results.length > 0) {
        setCurrentDoc(results[0]);
        setAllDocuments((prev) => [...results, ...prev]);

        if (currentUser?.uid) {
          results.forEach((doc) => saveDocumentToFirestore(currentUser.uid, doc));
        }
      }
      setActiveTab('classifier');
      return results;
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle review sign-off
  const handleSaveReview = (
    docId: string,
    status: ReviewStatus,
    reviewerName: string,
    reviewerNotes: string,
    overriddenTier?: RiskTier,
    overrideReason?: string
  ) => {
    setAllDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === docId) {
          const updatedDoc: DocumentClassification = {
            ...doc,
            auditReview: {
              status,
              reviewerName: reviewerName || userProfile?.name || 'Compliance Auditor',
              reviewerNotes,
              reviewedAt: new Date().toISOString(),
              overriddenRiskTier: overriddenTier,
              overrideReason
            }
          };
          if (currentDoc?.id === docId) {
            setCurrentDoc(updatedDoc);
          }

          if (currentUser?.uid) {
            saveDocumentToFirestore(currentUser.uid, updatedDoc);
          }

          return updatedDoc;
        }
        return doc;
      })
    );
  };

  const handleExportPdf = () => {
    if (currentDoc) {
      exportDocumentPdfSummary(currentDoc);
    }
  };

  const pendingReviewCount = allDocuments.filter(
    (d) => d.auditReview.status === 'PENDING_REVIEW'
  ).length;

  // Separate Dedicated Login Gateway: only authenticated auditors can access the AI
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-[#080d08] text-slate-100 flex flex-col relative selection:bg-lime-400 selection:text-black overflow-x-hidden">
      
      {/* Ambient lime glow backdrop (Matches reference image) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-lime-500/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[300px] bg-emerald-500/[0.05] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingReviewCount={pendingReviewCount}
        totalAnalyzedCount={allDocuments.length}
        thresholds={thresholds}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        currentDocument={currentDoc}
        onExportPdf={handleExportPdf}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
        
        {/* Tab 1: Classifier Workbench */}
        {activeTab === 'classifier' && (
          <div className="space-y-6">
            <RecentActivityPanel
              recentDocuments={allDocuments.slice(0, 5)}
              currentDocumentId={currentDoc?.id}
              onSelectDocument={(doc) => setCurrentDoc(doc)}
              onExportPdf={(doc) => exportDocumentPdfSummary(doc)}
            />

            <WorkbenchSearchBar
              documents={allDocuments}
              activeDocumentId={currentDoc?.id}
              onSelectDocument={(doc) => setCurrentDoc(doc)}
            />

            <DocumentIngestion
              onAnalyze={handleAnalyzeDocument}
              onAnalyzeBatch={handleAnalyzeBatch}
              isAnalyzing={isAnalyzing}
              onOpenSyntheticModal={() => setIsSyntheticOpen(true)}
            />

            {currentDoc && (
              <ClassificationDetails
                document={currentDoc}
                onOpenCleanerDiff={() => setIsCleanerDiffOpen(true)}
                onOpenReviewDrawer={() => {
                  setSelectedReviewDoc(currentDoc);
                  setIsReviewDrawerOpen(true);
                }}
                confidenceThreshold={thresholds.confidenceThreshold}
                highRiskThreshold={thresholds.highRiskScoreThreshold}
                onExportPdf={handleExportPdf}
              />
            )}
          </div>
        )}

        {/* Tab 2: Manual Review Queue */}
        {activeTab === 'review_queue' && (
          <ManualReviewQueue
            documents={allDocuments}
            onSelectDocument={(doc) => {
              setCurrentDoc(doc);
              setActiveTab('classifier');
            }}
            onOpenReviewDrawer={(doc) => {
              setSelectedReviewDoc(doc);
              setIsReviewDrawerOpen(true);
            }}
            confidenceThreshold={thresholds.confidenceThreshold}
            highRiskThreshold={thresholds.highRiskScoreThreshold}
          />
        )}

        {/* Tab 3: Evaluation & Confusion Matrix */}
        {activeTab === 'evaluation' && (
          <EvaluationDashboard
            thresholds={thresholds}
            onUpdateThresholds={setThresholds}
            documents={allDocuments}
          />
        )}

        {/* Tab 4: Document Corpus & Taxonomy */}
        {activeTab === 'corpus' && (
          <CorpusLibrary
            onAnalyzeSample={(sample: SampleDoc) => {
              handleAnalyzeDocument(sample.content, sample.title, sample.type);
            }}
            onOpenSyntheticModal={() => setIsSyntheticOpen(true)}
          />
        )}

      </main>

      {/* Modals & Drawers */}
      <ThresholdSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        thresholds={thresholds}
        onSave={setThresholds}
      />

      {currentDoc && (
        <CleanerDiffModal
          isOpen={isCleanerDiffOpen}
          onClose={() => setIsCleanerDiffOpen(false)}
          document={currentDoc}
        />
      )}

      <ReviewDrawer
        isOpen={isReviewDrawerOpen}
        onClose={() => setIsReviewDrawerOpen(false)}
        document={selectedReviewDoc || currentDoc}
        onSaveReview={handleSaveReview}
      />

      <SyntheticGeneratorModal
        isOpen={isSyntheticOpen}
        onClose={() => setIsSyntheticOpen(false)}
        onGenerated={(text, title, category) => {
          handleAnalyzeDocument(text, title, category);
        }}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </div>
  );
}

