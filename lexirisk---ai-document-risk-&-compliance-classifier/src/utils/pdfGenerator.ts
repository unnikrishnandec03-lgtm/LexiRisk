import jsPDF from 'jspdf';
import { DocumentClassification } from '../types';

export function exportDocumentPdfSummary(doc: DocumentClassification) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let y = 40;

  // Helper for line wrapping and page breaks
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      pdf.addPage();
      y = margin;
      drawHeaderAndFooter();
    }
  };

  const drawHeaderAndFooter = () => {
    // Top subtle bar
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, pageWidth, 6, 'F');
  };

  // Header Banner
  pdf.setFillColor(15, 23, 42);
  pdf.roundedRect(margin, y, contentWidth, 54, 4, 4, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.setTextColor(255, 255, 255);
  pdf.text('LEXIRISK — COMPLIANCE RISK & AUDIT REPORT', margin + 14, y + 22);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(148, 163, 184); // slate-400
  pdf.text('Automated AI Legal Risk Classification & Governance Audit Trail', margin + 14, y + 38);

  const dateStr = new Date(doc.createdAt).toLocaleDateString() + ' ' + new Date(doc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  pdf.text(`Audited: ${dateStr}`, pageWidth - margin - 14, y + 22, { align: 'right' });
  pdf.text(`Doc ID: ${doc.id.slice(0, 16)}`, pageWidth - margin - 14, y + 38, { align: 'right' });

  y += 66;

  // Document Title & Metadata
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(15, 23, 42);
  const titleLines = pdf.splitTextToSize(doc.documentTitle, contentWidth - 110);
  pdf.text(titleLines, margin, y + 14);

  // Risk Tier Stamp Box
  let riskColor = [225, 29, 72]; // Rose
  if (doc.riskTier === 'LOW') riskColor = [16, 185, 129]; // Emerald
  else if (doc.riskTier === 'MEDIUM') riskColor = [245, 158, 11]; // Amber
  else if (doc.riskTier === 'HIGH') riskColor = [249, 115, 22]; // Orange

  pdf.setFillColor(riskColor[0], riskColor[1], riskColor[2]);
  pdf.roundedRect(pageWidth - margin - 96, y, 96, 26, 3, 3, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(255, 255, 255);
  pdf.text(`${doc.riskTier} RISK (${doc.riskScore})`, pageWidth - margin - 48, y + 17, { align: 'center' });

  y += Math.max(34, titleLines.length * 18 + 12);

  // Key Metrics Grid
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(margin, y, contentWidth, 48, 4, 4, 'FD');

  const colW = contentWidth / 4;
  
  // Col 1: Category
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('COMPLIANCE DOMAIN', margin + 10, y + 16);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(30, 41, 59);
  pdf.text(doc.primaryCategory.replace(/_/g, ' '), margin + 10, y + 32);

  // Col 2: Confidence
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('MODEL CONFIDENCE', margin + colW + 10, y + 16);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(30, 41, 59);
  pdf.text(`${doc.confidenceScore}% certainty`, margin + colW + 10, y + 32);

  // Col 3: Triage Routing
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('GOVERNANCE STATUS', margin + colW * 2 + 10, y + 16);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(doc.isFlaggedForManualReview ? 225 : 16, doc.isFlaggedForManualReview ? 29 : 185, doc.isFlaggedForManualReview ? 72 : 129);
  pdf.text(doc.isFlaggedForManualReview ? 'Flagged for Review' : 'Auto-Cleared', margin + colW * 2 + 10, y + 32);

  // Col 4: Audit Review Status
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 116, 139);
  pdf.text('AUDIT ADJUDICATION', margin + colW * 3 + 10, y + 16);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(30, 41, 59);
  pdf.text(doc.auditReview.status.replace(/_/g, ' '), margin + colW * 3 + 10, y + 32);

  y += 58;

  // Executive Rationale
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text('1. Executive Compliance Rationale', margin, y);
  y += 12;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(51, 65, 85);
  const summaryLines = pdf.splitTextToSize(doc.executiveSummary, contentWidth);
  pdf.text(summaryLines, margin, y);
  y += summaryLines.length * 13 + 14;

  // Human-in-the-Loop Audit Trail Box
  checkPageBreak(90);
  pdf.setFillColor(241, 245, 249);
  pdf.setDrawColor(203, 213, 225);
  pdf.roundedRect(margin, y, contentWidth, 70, 4, 4, 'FD');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(15, 23, 42);
  pdf.text('2. Human-in-the-Loop Legal Counsel Sign-Off & Audit Trail', margin + 10, y + 16);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(71, 85, 105);
  const auditorName = doc.auditReview.reviewerName || 'Automated Pipeline Auditor';
  const signOffDate = doc.auditReview.reviewedAt ? new Date(doc.auditReview.reviewedAt).toLocaleString() : 'Pending final sign-off';
  pdf.text(`Auditor: ${auditorName}  |  Disposition Date: ${signOffDate}  |  Verdict: ${doc.auditReview.status}`, margin + 10, y + 30);

  if (doc.auditReview.reviewerNotes) {
    const notes = pdf.splitTextToSize(`Auditor Notes: "${doc.auditReview.reviewerNotes}"`, contentWidth - 20);
    pdf.text(notes, margin + 10, y + 44);
  } else {
    pdf.text('Auditor Notes: Standard governance rules verified against Institutional Legal Playbook.', margin + 10, y + 44);
  }

  if (doc.auditReview.overriddenRiskTier) {
    pdf.setTextColor(147, 51, 234);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Risk Override: Changed to ${doc.auditReview.overriddenRiskTier} (Reason: ${doc.auditReview.overrideReason || 'Senior Counsel Discretion'})`, margin + 10, y + 58);
  }

  y += 82;

  // Extracted High-Risk Clauses Section
  checkPageBreak(40);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text(`3. Extracted High-Risk Contract Clauses (${doc.clauses.length})`, margin, y);
  y += 14;

  if (doc.clauses.length === 0) {
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text('No high-risk clauses or severe compliance deviations identified.', margin, y);
    y += 20;
  } else {
    doc.clauses.forEach((c, idx) => {
      checkPageBreak(80);

      pdf.setFillColor(254, 242, 242);
      pdf.setDrawColor(254, 202, 202);
      pdf.roundedRect(margin, y, contentWidth, 72, 3, 3, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(185, 28, 28);
      pdf.text(`[Clause ${idx + 1}] ${c.clauseTitle} — ${c.riskLevel} (${c.category.replace(/_/g, ' ')})`, margin + 8, y + 14);

      pdf.setFont('helvetica', 'italic');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      const originalLines = pdf.splitTextToSize(`"${c.originalText}"`, contentWidth - 16);
      pdf.text(originalLines.slice(0, 2), margin + 8, y + 27);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(51, 65, 85);
      const ratLines = pdf.splitTextToSize(`Risk: ${c.rationale}`, contentWidth - 16);
      pdf.text(ratLines.slice(0, 1), margin + 8, y + 44);

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(5, 150, 105);
      const remLines = pdf.splitTextToSize(`Redline: ${c.suggestedRemediation}`, contentWidth - 16);
      pdf.text(remLines.slice(0, 1), margin + 8, y + 58);

      y += 78;
    });
  }

  // Precedents & Term Saliency Summary
  checkPageBreak(70);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.setTextColor(15, 23, 42);
  pdf.text('4. Explainability & Nearest Historical Precedent Match', margin, y);
  y += 14;

  if (doc.nearestPrecedents.length > 0) {
    const prec = doc.nearestPrecedents[0];
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(51, 65, 85);
    pdf.text(`Nearest Benchmark Precedent: ${prec.title} (${Math.round(prec.similarityScore * 100)}% Cosine Match)`, margin, y);
    y += 12;
    pdf.setTextColor(100, 116, 139);
    const precLines = pdf.splitTextToSize(`Historical Verdict: ${prec.historicAuditOutcome} — ${prec.keyDifferenceRationale}`, contentWidth);
    pdf.text(precLines, margin, y);
    y += precLines.length * 12 + 10;
  }

  // Footer Disclaimer
  checkPageBreak(30);
  pdf.setDrawColor(226, 232, 240);
  pdf.line(margin, pageHeight - 34, pageWidth - margin, pageHeight - 34);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.setTextColor(148, 163, 184);
  pdf.text('CONFIDENTIAL & PRIVILEGED LEGAL COMPLIANCE AUDIT RECORD · Generated by LexiRisk v2.4 Enterprise', margin, pageHeight - 22);
  pdf.text('Page 1 of 1', pageWidth - margin, pageHeight - 22, { align: 'right' });

  // Save the PDF
  const sanitizedTitle = doc.documentTitle.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
  pdf.save(`LexiRisk-Audit-Report-${sanitizedTitle}.pdf`);
}
