import { collection, doc, getDocs, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { DocumentClassification } from '../types';

export async function saveDocumentToFirestore(userId: string, document: DocumentClassification) {
  if (!userId) return;
  try {
    const docRef = doc(db, 'users', userId, 'documents', document.id);
    await setDoc(docRef, {
      id: document.id,
      userId,
      documentTitle: document.documentTitle,
      documentType: document.documentType,
      createdAt: document.createdAt,
      riskTier: document.riskTier,
      riskScore: document.riskScore,
      confidenceScore: document.confidenceScore,
      primaryCategory: document.primaryCategory,
      secondaryCategories: document.secondaryCategories,
      executiveSummary: document.executiveSummary,
      isFlaggedForManualReview: document.isFlaggedForManualReview,
      flagReasons: document.flagReasons,
      clauses: document.clauses,
      saliencyTerms: document.saliencyTerms,
      nearestPrecedents: document.nearestPrecedents,
      auditReview: document.auditReview,
      cleanSummary: document.cleanSummary,
      rawText: document.rawText.slice(0, 15000), // Firestore document limit safeguard
      cleanedText: document.cleanedText.slice(0, 15000)
    }, { merge: true });
    console.log(`[Firestore] Persisted document ${document.id} for user ${userId}`);
  } catch (err) {
    console.warn(`[Firestore] Failed to save document ${document.id}:`, err);
  }
}

export async function loadUserDocumentsFromFirestore(userId: string): Promise<DocumentClassification[]> {
  if (!userId) return [];
  try {
    const collRef = collection(db, 'users', userId, 'documents');
    const q = query(collRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return [];

    return snapshot.docs.map((d) => d.data() as DocumentClassification);
  } catch (err) {
    console.warn('[Firestore] Could not load user documents:', err);
    return [];
  }
}
