import { BenchmarkPrecedent } from '../types';

export const HISTORIC_PRECEDENTS: BenchmarkPrecedent[] = [
  {
    id: 'prec-001',
    title: 'Precedent MSA-2023-VND-04 (Global Infrastructure Cloud)',
    category: 'LIABILITY_INDEMNITY',
    riskLevel: 'HIGH',
    similarityScore: 0.88,
    historicAuditOutcome: 'REJECTED',
    matchingClauseSnippet: 'Customer shall indemnify Vendor for any and all third-party claims without limitation or cap.',
    keyDifferenceRationale: 'Precedent was rejected by Corporate Legal because Vendor refused to add a mutual aggregate liability cap or carve out gross negligence.'
  },
  {
    id: 'prec-002',
    title: 'Precedent DPA-2024-EU-81 (Transatlantic Cloud Storage)',
    category: 'GDPR_PRIVACY',
    riskLevel: 'MEDIUM',
    similarityScore: 0.82,
    historicAuditOutcome: 'APPROVED_WITH_AMENDMENT',
    matchingClauseSnippet: 'Notification within 14 calendar days of a personal data breach with restricted on-site audits.',
    keyDifferenceRationale: 'Compliance Committee required adding EU Standard Contractual Clauses (Module 2 Controller-to-Processor) and reducing breach notification to 48 hours.'
  },
  {
    id: 'prec-003',
    title: 'Precedent FIN-2022-AML-09 (Middle East Freight Forwarding)',
    category: 'AML_FINANCIAL',
    riskLevel: 'CRITICAL',
    similarityScore: 0.91,
    historicAuditOutcome: 'REJECTED',
    matchingClauseSnippet: 'Payments disbursed in bearer instruments or alternate offshore nominee accounts without UBO disclosure.',
    keyDifferenceRationale: 'Strict rejection by Financial Crimes Compliance due to FATF high-risk jurisdiction and non-cooperative third-party bank routing.'
  },
  {
    id: 'prec-004',
    title: 'Precedent DEV-2024-ENG-33 (Embedded Firmware Subcontract)',
    category: 'IP_CONFIDENTIALITY',
    riskLevel: 'HIGH',
    similarityScore: 0.84,
    historicAuditOutcome: 'APPROVED_WITH_AMENDMENT',
    matchingClauseSnippet: 'Subcontractor retains core algorithmic libraries and assigns improvements exclusively to outsourcer.',
    keyDifferenceRationale: 'Amended to insert full Work-Made-For-Hire assignment and absolute warranty against copyleft GPL contamination.'
  },
  {
    id: 'prec-005',
    title: 'Precedent MNDA-2025-CORP-101 (Standard Corporate Non-Disclosure)',
    category: 'IP_CONFIDENTIALITY',
    riskLevel: 'LOW',
    similarityScore: 0.94,
    historicAuditOutcome: 'APPROVED_UNCONDITIONAL',
    matchingClauseSnippet: 'Balanced standard definition of confidential information with 2-year survival period and standard exclusions.',
    keyDifferenceRationale: 'Cleared by automated compliance pipeline with zero flagged deviations from standard institutional legal playbook.'
  },
  {
    id: 'prec-006',
    title: 'Precedent DEF-2023-EAR-12 (Avionics Component Manufacturing)',
    category: 'EXPORT_REGULATORY',
    riskLevel: 'HIGH',
    similarityScore: 0.86,
    historicAuditOutcome: 'REJECTED',
    matchingClauseSnippet: 'Silicon micro-fabrication subcontracting in foreign jurisdiction prior to State Department DSP-5 approval.',
    keyDifferenceRationale: 'Export Control Officer flagged felony ITAR/EAR exposure; required US-domiciled ITAR certified clean room facility.'
  },
  {
    id: 'prec-007',
    title: 'Precedent GOV-2023-FCPA-44 (Public Infrastructure Liaison)',
    category: 'FCPA_ANTI_CORRUPTION',
    riskLevel: 'CRITICAL',
    similarityScore: 0.89,
    historicAuditOutcome: 'REJECTED',
    matchingClauseSnippet: 'Discretionary non-invoiced entertainment and facilitation honorariums for municipal procurement officials.',
    keyDifferenceRationale: 'Direct violation of US Foreign Corrupt Practices Act and internal Zero-Tolerance Anti-Bribery Governance Charter.'
  }
];
