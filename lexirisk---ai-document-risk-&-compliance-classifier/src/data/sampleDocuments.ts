import { BenchmarkEvaluationDataset, ComplianceCategory, RiskTier } from '../types';

export interface SampleDoc {
  id: string;
  title: string;
  type: string;
  expectedRisk: RiskTier;
  expectedCategory: ComplianceCategory;
  description: string;
  content: string;
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'sample-1',
    title: 'Cloud Vendor Master Services Agreement (MSA) - Uncapped Risk',
    type: 'Vendor Contract',
    expectedRisk: 'HIGH',
    expectedCategory: 'LIABILITY_INDEMNITY',
    description: 'Contains unlimited liability for indirect damages, unilateral indemnification, and offshore unencrypted data routing without SCCs.',
    content: `MASTER SERVICES AGREEMENT - VENDOR REVISED DRAFT v3.2
CONFIDENTIAL & PROPRIETARY

Page 1 of 14 | Doc Ref: MSA-2026-CLOUD-9982

1. SERVICES AND DELIVERABLES
Vendor shall provide Customer with managed cloud infrastructure services as described in Statement of Work #1. Vendor may modify infrastructure architecture or migrate workloads to any third-party data center located in international territories without prior written notice to Customer.

2. FEES, TAXES, AND PAYMENT TERMS
Customer shall pay all invoices within thirty (30) calendar days of invoice date. Late payments shall accrue interest at 2.5% per month or the highest rate permitted by law.

3. INDEMNIFICATION AND UNLIMITED THIRD-PARTY LIABILITY
Customer shall defend, indemnify, and hold harmless Vendor, its affiliates, directors, officers, agents, and subcontractors from and against ANY AND ALL losses, liabilities, damages, judgments, and legal fees arising out of: (i) any claim by a third party relating to Customer Data; (ii) any breach of this Agreement by Customer; or (iii) any disruption to Vendor service caused directly or indirectly by Customer traffic. THIS INDEMNIFICATION OBLIGATION SHALL BE UNLIMITED IN AMOUNT AND SHALL NOT BE SUBJECT TO ANY CAP OR EXCLUSION SET FORTH IN SECTION 4.

4. LIMITATION OF LIABILITY
NOTWITHSTANDING ANYTHING TO THE CONTRARY IN THIS AGREEMENT:
(a) VENDOR'S MAXIMUM AGGREGATE LIABILITY ARISING OUT OF OR RELATED TO THIS AGREEMENT, WHETHER IN CONTRACT, TORT (INCLUDING NEGLIGENCE), OR OTHERWISE, SHALL BE STRICTLY LIMITED TO FIFTY DOLLARS ($50.00 USD).
(b) IN NO EVENT SHALL VENDOR BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING LOSS OF PROFITS, DATA LOSS, OR SYSTEM DOWNTIME, EVEN IF ADVISED OF THE POSSIBILITY THEREOF.
(c) CUSTOMER WAIVES ANY STATUTORY PROTECTIONS LIMITING VENDOR'S NEGLIGENCE.

5. DATA PRIVACY AND INTERNATIONAL DATA TRANSFERS
Customer acknowledges that Vendor may process, store, and transmit Customer Personal Data across global server farms, including jurisdictions outside the European Economic Area that have not received an adequacy decision from the European Commission. Vendor shall have no obligation to execute Standard Contractual Clauses (SCCs) unless Customer pays an additional regulatory compliance surcharge of $15,000 annually. In the event of a Personal Data breach, Vendor shall notify Customer within thirty (30) business days following forensic completion.

6. GOVERNING LAW AND JURISDICTION
This Agreement shall be construed under the laws of the Cayman Islands. Any dispute shall be settled by binding arbitration in George Town, Cayman Islands.`
  },
  {
    id: 'sample-2',
    title: 'Cross-Border Intermediary Mandate (AML & Sanctions Red Flags)',
    type: 'Financial & Advisory Agreement',
    expectedRisk: 'CRITICAL',
    expectedCategory: 'AML_FINANCIAL',
    description: 'Contains high-risk financial crime indicators: cash routing via third-party offshore trusts, exemption from KYC disclosures, and undefined facilitation fees.',
    content: `INTERNATIONAL LOGISTICS CONSULTING & COMMODITIES BROKERAGE MANDATE
Reference: MANDATE-GLOBAL-TX-701
Date: March 14, 2026

BETWEEN:
Alpha Apex Global Holdings Ltd (Registered in Port Vila, Republic of Vanuatu) ("Intermediary")
AND:
Nexus Industrial Solutions Corp ("Client")

RECITALS:
Client requires specialized clearing, supply-chain expediting, and trade facilitation services in transshipment hubs located in Central Asia, the Middle East, and border territories.

TERMS & CONDITIONS:

ARTICLE 1: SCOPE OF TRADE FACILITATION
Intermediary shall coordinate export permits, customs clearance, and port demurrage reductions with local municipal regulators, border commandants, and maritime authorities. Client recognizes that expeditious passage may necessitate discrete governmental liaison fees and administrative customs honorariums.

ARTICLE 2: COMPENSATION AND PAYMENT ROUTING
(a) Client shall remit a non-refundable retainer of $250,000 USD to a designated escrow bank account in Nicosia, Cyprus, or an alternate nominee entity account as designated by Intermediary forty-eight (48) hours prior to wire transfer.
(b) Client agrees that payments may be disbursed in cash, bearer bonds, or cryptocurrency (USDT) at the sole discretion of Intermediary to ensure local transit velocity.
(c) Neither party shall inquire into the beneficial ownership or ultimate banking details of sub-agents retained by Intermediary in transshipment jurisdictions.

ARTICLE 3: ANTI-MONEY LAUNDERING AND REGULATORY CARVE-OUT
While both parties respect general commercial ethical standards, Client explicitly waives any requirement for Intermediary to provide Source of Wealth documentation, Ultimate Beneficial Owner (UBO) filings, or politically exposed person (PEP) attestation declarations for secondary contractors. Intermediary shall not be subject to foreign extraterritorial audit rights under the US Foreign Corrupt Practices Act (FCPA) or UK Bribery Act 2010.

ARTICLE 4: TRADE RESTRICTIONS & EMBARGOED JURISDICTIONS
The goods facilitated hereunder may originate from or pass through jurisdictions currently subject to targeted economic sanctions or export trade controls. Client warrants that it holds general licenses or that transshipment via intermediary free-trade trade zones effectively re-flags the cargo documentation to satisfy transit port authorities.`
  },
  {
    id: 'sample-3',
    title: 'Offshore Software Development Agreement (IP Infringement Risk)',
    type: 'IP & Engineering Agreement',
    expectedRisk: 'HIGH',
    expectedCategory: 'IP_CONFIDENTIALITY',
    description: 'Developer reserves joint ownership of core proprietary IP, requires customer to surrender patents, and permits inclusion of restrictive GPL code.',
    content: `SOFTWARE OUTSOURCING AND ENGINEERING SERVICES AGREEMENT
Execution Date: January 15, 2026

1. BACKGROUND
Company desires to hire Outsourcer to engineer a proprietary algorithmic trading platform and underlying machine learning model weights.

2. INTELLECTUAL PROPERTY RIGHTS AND WORK PRODUCT
(a) Section 2.1 - Retained Rights: Outsourcer shall retain exclusive ownership of all underlying code libraries, frameworks, proprietary algorithmic routines, and model training methodologies utilized in developing the Software ("Outsourcer Core IP").
(b) Section 2.2 - Customer License: Outsourcer grants Customer a non-exclusive, revocable, non-transferable license to use the Deliverables solely for internal evaluation. Full commercial deployment requires execution of a separate perpetual royalty license.
(c) Section 2.3 - Assignment of Inventions: Customer expressly agrees that any improvements, novel algorithmic insights, or patentable inventions devised jointly or by Customer employees during the course of testing the Deliverables shall automatically be assigned exclusively to Outsourcer without additional consideration.
(d) Section 2.4 - Open Source Software: Outsourcer may incorporate copyleft Open Source Software, including software distributed under the GNU General Public License v3 (GPLv3) or Affero GPL (AGPL). Customer agrees that if incorporation of such open source software forces Customer to disclose Customer's proprietary core trading code to the general public, Outsourcer shall bear no liability or indemnification duty.

3. CONFIDENTIALITY EXCLUSIONS
Information shall not be considered confidential if Outsourcer determines it is beneficial to share with Outsourcer's other industry clients as general industry benchmark telemetry.`
  },
  {
    id: 'sample-4',
    title: 'Enterprise SaaS Subscription Agreement (Moderate Risk Terms)',
    type: 'SaaS Agreement',
    expectedRisk: 'MEDIUM',
    expectedCategory: 'OPERATIONAL_SLA',
    description: 'Standard enterprise terms but includes asymmetrical liability caps (2x fees for provider, unlimited for customer) and vague 99.0% SLA uptime calculation.',
    content: `SOFTWARE AS A SERVICE (SAAS) SUBSCRIPTION AGREEMENT

Document ID: ENT-SAAS-2026-441
Effective Date: February 1, 2026

PARTIES:
DataPulse Technologies Inc. ("Provider")
AND
Horizon Financial Services Ltd ("Subscriber")

1. SUBSCRIPTION GRANT
Provider grants Subscriber a non-exclusive, non-sublicensable right to access and use the DataPulse Analytics Platform during the Subscription Term in accordance with the Order Form.

2. SERVICE LEVEL AGREEMENT (SLA) & UPTIME
Provider targets an overall system uptime of 99.0% calculated on a quarterly basis, excluding scheduled maintenance and emergency security patching.
If Provider fails to meet the 99.0% target in any calendar quarter, Subscriber's sole and exclusive remedy shall be to receive a service credit equal to 5% of that quarter's fee, applied against future renewal invoices. Service credits are non-refundable and forfeit upon contract termination.

3. LIMITATION OF LIABILITY
(a) PROVIDER'S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT SHALL BE STRICTLY LIMITED TO THE TOTAL FEES ACTUALLY PAID BY SUBSCRIBER TO PROVIDER IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
(b) SUBSCRIBER'S LIABILITY FOR BREACH OF ACCEPTABLE USE OR CONFIDENTIALITY SHALL BE SUBJECT TO A SEPARATE LIABILITY CAP EQUAL TO FIVE TIMES (5X) THE ANNUAL CONTRACT VALUE.

4. DATA PROTECTION
Provider will maintain commercially reasonable administrative, physical, and technical safeguards designed to protect Customer Data. Provider will notify Subscriber within seven (7) calendar days in the event of a verified breach of unencrypted Customer Data.`
  },
  {
    id: 'sample-5',
    title: 'GDPR Data Processing Addendum (DPA) - Audit Clause Ambiguity',
    type: 'Privacy Addendum',
    expectedRisk: 'MEDIUM',
    expectedCategory: 'GDPR_PRIVACY',
    description: 'Has valid standard clauses but restricts customer on-site audit rights to once every 3 years with $10,000 upfront auditor fee and 14-day breach notification.',
    content: `DATA PROCESSING ADDENDUM (DPA)
Pursuant to Article 28 of Regulation (EU) 2016/679 (General Data Protection Regulation)

This Data Processing Addendum supplements the Principal Agreement between Controller and Processor.

1. SCOPE AND NATURE OF PROCESSING
Processor processes personal data on behalf of Controller solely for the provision of cloud analytics as specified in Schedule 1.

2. AUDIT AND INSPECTION RIGHTS
(a) Pursuant to GDPR Article 28(3)(h), Controller may request verification of Processor's technical and organizational measures.
(b) Such inspections shall be satisfied exclusively by Processor providing its most recent SOC 2 Type II report and ISO 27001 summary certificate.
(c) On-site physical inspections by Controller or an independent accredited auditor shall be permitted no more than once every thirty-six (36) months, provided Controller pays Processor a non-refundable preparation fee of $10,000 USD at least sixty (60) days in advance of the planned audit date.

3. SECURITY INCIDENT NOTIFICATION
Processor shall inform Controller in writing without undue delay, and in any event within fourteen (14) calendar days, after Processor confirms that a Personal Data Breach has occurred that compromises Controller's unencrypted personal data.

4. SUB-PROCESSORS
Processor has general authorization to appoint third-party sub-processors. Processor shall maintain an updated list of sub-processors on its public website. Controller shall monitor the website periodically; failure to object within 5 business days of posting shall constitute irrevocable acceptance.`
  },
  {
    id: 'sample-6',
    title: 'Standard Mutual Non-Disclosure Agreement (Low Risk Clean)',
    type: 'NDA / Confidentiality',
    expectedRisk: 'LOW',
    expectedCategory: 'IP_CONFIDENTIALITY',
    description: 'Market-standard balanced 2-year mutual NDA with standard exclusions, clear definition of confidential info, and standard jurisdiction.',
    content: `MUTUAL NON-DISCLOSURE AGREEMENT

This Mutual Non-Disclosure Agreement ("Agreement") is entered into as of April 1, 2026 ("Effective Date"), by and between:
Company A, Inc., a Delaware corporation, and Company B, LLC, a California limited liability company.

1. PURPOSE
The parties wish to explore a potential business collaboration regarding enterprise software integration ("Purpose") and in connection with this Purpose, each party may disclose certain confidential information to the other.

2. CONFIDENTIAL INFORMATION
"Confidential Information" means all non-public information disclosed by one party ("Disclosing Party") to the other party ("Receiving Party"), whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure.

3. EXCLUSIONS FROM CONFIDENTIAL INFORMATION
Confidential Information does not include information that:
(a) is or becomes publicly known through no breach of this Agreement by Receiving Party;
(b) was already known to Receiving Party prior to disclosure without confidentiality restrictions;
(c) is independently developed by Receiving Party without reference to or use of Disclosing Party's Confidential Information; or
(d) is rightfully received from a third party without duty of confidentiality.

4. OBLIGATIONS OF RECEIVING PARTY
Receiving Party shall:
(a) use the same degree of care it uses to protect its own confidential information of like nature, but no less than reasonable care;
(b) use Confidential Information solely to evaluate the Purpose; and
(c) restrict disclosure of Confidential Information to its employees, directors, and legal advisors who have a need to know and are bound by confidentiality obligations at least as restrictive as those herein.

5. TERM AND TERMINATION
This Agreement and the confidentiality obligations herein shall survive for a period of two (2) years from the Effective Date, except for trade secrets, which shall be protected for so long as they remain trade secrets under applicable law.

6. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without giving effect to conflicts of laws principles.`
  },
  {
    id: 'sample-7',
    title: 'Commercial Office Space Lease Agreement (Standard Low Risk)',
    type: 'Facility Lease',
    expectedRisk: 'LOW',
    expectedCategory: 'OPERATIONAL_SLA',
    description: 'Standard balanced commercial lease with mutual commercial insurance requirements, standard cure periods, and customary tenant protections.',
    content: `COMMERCIAL FACILITY LEASE AGREEMENT

PARTIES:
Apex Metro Properties LLC ("Landlord")
AND
Veritas Software Systems Inc. ("Tenant")

PREMISES: Suite 400, 500 Technology Way, Austin, Texas 78701.
TERM: 36 Months commencing May 1, 2026.

1. RENT AND OPERATING EXPENSES
Tenant shall pay base monthly rent of $18,500.00 USD on or before the first day of each calendar month. Tenant shall pay its proportionate share (4.2%) of normal common area maintenance (CAM) expenses, subject to a 5% annual controllable expense cap.

2. REPAIRS AND MAINTENANCE
Landlord shall maintain the structural foundations, roof, exterior walls, HVAC central plant, and common areas in good working order. Tenant shall maintain the interior demised premises in clean condition.

3. INSURANCE AND MUTUAL WAIVER OF SUBROGATION
Each party shall carry Commercial General Liability insurance with limits of not less than $2,000,000 per occurrence. Landlord and Tenant each waive any and all rights of recovery against each other for loss or damage to property to the extent covered by valid property insurance in effect.

4. DEFAULT AND NOTICE TO CURE
In the event of monetary default, Landlord shall provide Tenant written notice and five (5) business days to cure. In the event of non-monetary default, Tenant shall have thirty (30) days following written notice to cure.

5. GOVERNING LAW
This Lease shall be governed by the laws of the State of Texas.`
  },
  {
    id: 'sample-8',
    title: 'Dual-Use Aerospace Subcontract (Export Controls & Sanctions)',
    type: 'Defense & Aerospace Contract',
    expectedRisk: 'HIGH',
    expectedCategory: 'EXPORT_REGULATORY',
    description: 'Involves strict ITAR/EAR defense technology with problematic clauses granting foreign subcontractor sub-licensing rights without State Department DSP-5 licenses.',
    content: `SUBCONTRACT FOR SATELLITE TELEMETRY COMPONENTS
ITAR / EAR REGULATORY CLASSIFICATION: ECCN 9A515.a

CONTRACTOR: AeroDefense Dynamics Corp (USA)
SUBCONTRACTOR: Pacific Oceanic Engineering Consortium (Overseas Facility)

SECTION 1: TECHNICAL DATA TRANSFER AND SUBLICENSING
1.1 Subcontractor shall manufacture telemetry sensor modules.
1.2 Notwithstanding US Export Administration Regulations (EAR) and International Traffic in Arms Regulations (ITAR) 22 C.F.R. § 120-130, Subcontractor is hereby authorized to outsource silicon micro-fabrication to any manufacturing partner in the Western Pacific basin without waiting for an executed State Department DSP-5 Technical Assistance Agreement (TAA).
1.3 Contractor agrees to indemnify Subcontractor against any civil fines, OFAC penalties, or Directorate of Defense Trade Controls (DDTC) enforcement actions arising from rapid tooling deployment.

SECTION 2: CLASSIFIED TECHNICAL SPECIFICATIONS
Subcontractor may store unencrypted design schematics on commercial cloud storage clusters accessible by third-party maintenance contractors, provided passwords are changed every ninety (90) days.`
  }
];

export const BENCHMARK_EVALUATION_DATASET: BenchmarkEvaluationDataset[] = [
  {
    id: 'bench-1',
    title: 'Cloud MSA with Uncapped Indemnity & Cayman Forum',
    groundTruthRisk: 'HIGH',
    groundTruthCategory: 'LIABILITY_INDEMNITY',
    description: 'Unlimited indemnification, $50 total liability cap, Cayman Islands forum.',
    text: SAMPLE_DOCUMENTS[0].content
  },
  {
    id: 'bench-2',
    title: 'Offshore Trade Intermediary Mandate with Cash Routing',
    groundTruthRisk: 'CRITICAL',
    groundTruthCategory: 'AML_FINANCIAL',
    description: 'Offshore payments, cash/crypto disbursements, waiver of FCPA/AML audits.',
    text: SAMPLE_DOCUMENTS[1].content
  },
  {
    id: 'bench-3',
    title: 'Software Dev Agreement with Pre-Existing IP Forfeiture',
    groundTruthRisk: 'HIGH',
    groundTruthCategory: 'IP_CONFIDENTIALITY',
    description: 'Customer surrenders patents, outsourcer retains core IP, mandatory AGPL risk.',
    text: SAMPLE_DOCUMENTS[2].content
  },
  {
    id: 'bench-4',
    title: 'Standard Enterprise SaaS Agreement with 1x Cap',
    groundTruthRisk: 'MEDIUM',
    groundTruthCategory: 'OPERATIONAL_SLA',
    description: 'Standard 1x fees liability cap, 99.0% SLA with modest service credits.',
    text: SAMPLE_DOCUMENTS[3].content
  },
  {
    id: 'bench-5',
    title: 'GDPR DPA with Restricted Audit and 14-Day Notice',
    groundTruthRisk: 'MEDIUM',
    groundTruthCategory: 'GDPR_PRIVACY',
    description: 'Audit restricted to 3 years and $10k fee, 14 days breach notification.',
    text: SAMPLE_DOCUMENTS[4].content
  },
  {
    id: 'bench-6',
    title: 'Standard Mutual Non-Disclosure Agreement (2-Year)',
    groundTruthRisk: 'LOW',
    groundTruthCategory: 'IP_CONFIDENTIALITY',
    description: 'Market-standard balanced mutual NDA, Delaware law, 2-year survival.',
    text: SAMPLE_DOCUMENTS[5].content
  },
  {
    id: 'bench-7',
    title: 'Commercial Office Space Lease Agreement',
    groundTruthRisk: 'LOW',
    groundTruthCategory: 'OPERATIONAL_SLA',
    description: 'Customary commercial lease with mutual subrogation and cure notices.',
    text: SAMPLE_DOCUMENTS[6].content
  },
  {
    id: 'bench-8',
    title: 'Satellite Subcontract with ITAR / DSP-5 Waiver',
    groundTruthRisk: 'HIGH',
    groundTruthCategory: 'EXPORT_REGULATORY',
    description: 'Waiver of State Dept DSP-5 export licenses, unencrypted telemetry storage.',
    text: SAMPLE_DOCUMENTS[7].content
  },
  {
    id: 'bench-9',
    title: 'Foreign Agent Marketing Consultancy with Discretionary Gifts',
    groundTruthRisk: 'CRITICAL',
    groundTruthCategory: 'FCPA_ANTI_CORRUPTION',
    description: 'Agent authorizes non-invoiced hospitality allowances for ministry procurement officers.',
    text: `CONSULTING ENGAGEMENT FOR SOUTHEAST ASIAN PUBLIC HEALTH PROCUREMENT
Consultant shall facilitate tender awards with regional ministerial health directors.
Client agrees to provide an unbudgeted monthly hospitality allowance of $45,000 for relationship maintenance and discrete executive favors to expedite tender approvals. No receipts or itemized accounting shall be required for payments made under this discretionary allowance.`
  },
  {
    id: 'bench-10',
    title: 'Vendor Master Procurement Order (Balanced Capped Terms)',
    groundTruthRisk: 'LOW',
    groundTruthCategory: 'LIABILITY_INDEMNITY',
    description: 'Standard 12-month mutual fee cap, standard warranty, conforming dispute resolution.',
    text: `MASTER PURCHASE ORDER TERMS AND CONDITIONS
1. Products shall conform to published specifications for 12 months.
2. In the event of defective goods, Vendor shall repair, replace, or refund at Customer election.
3. Each party's liability is capped at the total amount paid under the relevant Purchase Order in the preceding 12 months, except for gross negligence, willful misconduct, or breach of confidentiality.
4. Governed by the laws of New York.`
  }
];
