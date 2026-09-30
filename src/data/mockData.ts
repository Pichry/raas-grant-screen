export type Role = 'ADMIN' | 'GRANT_OFFICER' | 'APPLICANT';
export type AppStatus = 'DRAFT' | 'SUBMITTED' | 'PENDING' | 'SCREENING' | 'CLEARED' | 'NEEDS_REVIEW' | 'INCOMPLETE' | 'FLAGGED' | 'FINALIZED';
export type EligibilityResult = 'PASS' | 'FAIL' | 'REVIEW';
export type CompletenessResult = 'COMPLETE' | 'INCOMPLETE';
export type TextualOverlapStatus = 'NONE' | 'POTENTIAL_OVERLAP';
export type ApplicantType = 'University' | 'Research Institute' | 'NGO' | 'Government Agency' | 'Private Sector' | 'Hospital/Health Facility';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Application {
  id: string;
  applicantId?: string;
  applicantName: string;
  institution: string;
  applicantType: ApplicantType;
  email: string;
  title: string;
  abstract: string;
  keywords: string[];
  grantCall: string;
  submissionDate: string;
  documentUrl?: string;
  status: AppStatus;
  createdAt: string;
  similarityScore?: number;
}

export interface EligibilityCheck {
  rule: string;
  result: EligibilityResult;
  detail: string;
}

export interface SimilarProposal {
  proposalId: string;
  title: string;
  institution: string;
  year: string;
  similarityScore: number;
  matchedConcepts: string[];
}

export interface TextualOverlap {
  section: string;
  submittedText: string;
  sourceText: string;
  sourceProposalId: string;
  indicator: number;
}

export interface ScreeningResult {
  applicationId: string;
  eligibilityResult: EligibilityResult;
  eligibilityChecks: EligibilityCheck[];
  completenessResult: CompletenessResult;
  missingItems: string[];
  similarityScore: number;
  similarProposals: SimilarProposal[];
  textualOverlapStatus: TextualOverlapStatus;
  textualOverlaps: TextualOverlap[];
  aiSummary: string;
  aiKeyConcepts: string[];
  aiResearchDomain: string;
  aiRelevance: string;
  aiConcerns: string[];
  aiExplanation: string;
  flags: string[];
  humanReviewRequired: boolean;
  finalStatus: 'CLEARED_FOR_REVIEW' | 'NEEDS_HUMAN_REVIEW' | 'INCOMPLETE' | null;
  screenedAt: string;
  screenedBy: string;
}

export interface HistoricalProposal {
  id: string;
  proposalId: string;
  title: string;
  abstract: string;
  keywords: string[];
  institution: string;
  applicantName: string;
  grantYear: string;
  domain: string;
  status: 'Awarded' | 'Not Awarded' | 'Under Review';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  applicationId: string;
  action: string;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
  notes?: string;
}

// Demo users
export const DEMO_USERS: User[] = [
  { id: 'u1', name: 'Dr. Amina Uwase', email: 'admin@raas.rw', role: 'ADMIN' },
  { id: 'u2', name: 'Jean-Paul Nkurunziza', email: 'officer@raas.rw', role: 'GRANT_OFFICER' },
  { id: 'u3', name: 'Marie Mukamana', email: 'applicant@raas.rw', role: 'APPLICANT' },
];

export const GRANT_CALLS = [
  'NRIF-2025-PILOT-001',
  'NRIF-2025-HEALTH-002',
  'NRIF-2025-AGRI-003',
  'NRIF-2024-TECH-004',
];

// 15 sample applications
export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'APP-2025-001',
    applicantName: 'Dr. Marie-Claire Mukamurenzi',
    institution: 'University of Rwanda',
    applicantType: 'University',
    email: 'mc.mukamurenzi@ur.ac.rw',
    title: 'AI-Driven Early Detection of Cassava Mosaic Disease in Rwanda',
    abstract: 'This research proposes developing a mobile-based AI system for early detection of cassava mosaic disease across Rwanda\'s primary cassava-growing regions. Using convolutional neural networks trained on locally-collected leaf imagery, the system will provide real-time diagnostics to smallholder farmers, reducing crop losses by an estimated 35%. The platform integrates Kinyarwanda voice guidance for low-literacy users.',
    keywords: ['cassava', 'disease detection', 'AI', 'agriculture', 'mobile'],
    grantCall: 'NRIF-2025-AGRI-003',
    submissionDate: '2025-03-15',
    documentUrl: 'proposal_001.pdf',
    status: 'CLEARED',
    createdAt: '2025-03-15T09:30:00Z',
    similarityScore: 12,
  },
  {
    id: 'APP-2025-002',
    applicantName: 'Prof. Emmanuel Habimana',
    institution: 'Rwanda Biomedical Centre',
    applicantType: 'Research Institute',
    email: 'e.habimana@rbc.gov.rw',
    title: 'Genomic Surveillance of Antimicrobial Resistance in Rwandan Health Facilities',
    abstract: 'A comprehensive genomic surveillance program to track antimicrobial resistance (AMR) patterns across 12 district hospitals and 30 health centers in Rwanda. This study employs whole-genome sequencing to characterize resistance genes and transmission networks, informing national antibiotic stewardship policies and directly supporting Rwanda\'s national action plan on AMR.',
    keywords: ['AMR', 'genomics', 'surveillance', 'health', 'antimicrobial'],
    grantCall: 'NRIF-2025-HEALTH-002',
    submissionDate: '2025-03-20',
    documentUrl: 'proposal_002.pdf',
    status: 'NEEDS_REVIEW',
    createdAt: '2025-03-20T14:15:00Z',
    similarityScore: 67,
  },
  {
    id: 'APP-2025-003',
    applicantName: 'Eng. Diane Umuhoza',
    institution: 'Kigali Innovation City',
    applicantType: 'Research Institute',
    email: 'd.umuhoza@kic.rw',
    title: 'Smart Irrigation Systems Using IoT Sensors for Climate-Resilient Smallholder Farming',
    abstract: 'Development and deployment of low-cost IoT-enabled smart irrigation networks for smallholder farms in semi-arid zones of Eastern Rwanda. The system uses soil moisture sensors, weather APIs, and machine learning to optimize water use, reducing consumption by 40% while maintaining crop yields under projected climate change scenarios for 2030–2050.',
    keywords: ['IoT', 'irrigation', 'climate', 'smallholder', 'sensors'],
    grantCall: 'NRIF-2025-AGRI-003',
    submissionDate: '2025-03-22',
    documentUrl: 'proposal_003.pdf',
    status: 'SCREENING',
    createdAt: '2025-03-22T10:00:00Z',
    similarityScore: 45,
  },
  {
    id: 'APP-2025-004',
    applicantName: 'Dr. Patrick Nzeyimana',
    institution: 'University of Rwanda',
    applicantType: 'University',
    email: 'p.nzeyimana@ur.ac.rw',
    title: 'Machine Learning for Malaria Vector Control Optimization in Rwanda',
    abstract: 'This project applies machine learning models to optimize indoor residual spraying (IRS) campaigns by predicting malaria vector density based on climate, land-use, and intervention history data. Targeting 15 high-burden districts, the model aims to reduce malaria incidence by 25% while improving resource allocation efficiency for the Rwanda Malaria Program.',
    keywords: ['malaria', 'machine learning', 'vector control', 'health', 'Rwanda'],
    grantCall: 'NRIF-2025-HEALTH-002',
    submissionDate: '2025-03-25',
    documentUrl: 'proposal_004.pdf',
    status: 'NEEDS_REVIEW',
    createdAt: '2025-03-25T11:45:00Z',
    similarityScore: 38,
  },
  {
    id: 'APP-2025-005',
    applicantName: 'Ms. Claudine Uwineza',
    institution: 'Rwanda Agriculture Board',
    applicantType: 'Government Agency',
    email: 'c.uwineza@rab.gov.rw',
    title: 'Climate-Smart Soil Carbon Sequestration in Rwanda\'s Volcanic Highlands',
    abstract: 'Investigation of soil carbon sequestration potential across Rwanda\'s volcanic highland soils under climate-smart agricultural practices including agroforestry, cover cropping, and biochar application. The study will produce geo-referenced soil carbon maps and policy recommendations for integrating carbon markets into Rwanda\'s NDC implementation framework.',
    keywords: ['soil carbon', 'climate-smart', 'agroforestry', 'NDC', 'highland'],
    grantCall: 'NRIF-2025-PILOT-001',
    submissionDate: '2025-03-28',
    documentUrl: 'proposal_005.pdf',
    status: 'CLEARED',
    createdAt: '2025-03-28T08:30:00Z',
    similarityScore: 8,
  },
  {
    id: 'APP-2025-006',
    applicantName: 'Dr. Fidele Rurangirwa',
    institution: 'Rwanda Polytechnic',
    applicantType: 'University',
    email: 'f.rurangirwa@rp.ac.rw',
    title: 'Blockchain-Based Academic Credential Verification System for East Africa',
    abstract: 'A decentralized blockchain system for issuing and verifying academic credentials across East African universities, reducing credential fraud and streamlining cross-border professional recognition. Piloted at Rwanda Polytechnic with integration pathways for the EAC regional qualifications framework.',
    keywords: ['blockchain', 'credentials', 'education', 'East Africa', 'verification'],
    grantCall: 'NRIF-2025-PILOT-001',
    submissionDate: '2025-04-01',
    documentUrl: 'proposal_006.pdf',
    status: 'FLAGGED',
    createdAt: '2025-04-01T13:00:00Z',
    similarityScore: 84,
  },
  {
    id: 'APP-2025-007',
    applicantName: 'Dr. Goretti Dusabimana',
    institution: 'King Faisal Hospital',
    applicantType: 'Hospital/Health Facility',
    email: 'g.dusabimana@kfh.rw',
    title: 'Point-of-Care Diagnostics for Non-Communicable Diseases in Rural Rwanda',
    abstract: 'Evaluation and deployment of portable point-of-care diagnostic devices for early detection of diabetes, hypertension, and chronic kidney disease in rural health posts across Musanze and Rulindo districts. The project includes capacity building for community health workers and development of digital referral pathways integrated with Rwanda\'s iHRIS system.',
    keywords: ['NCD', 'point-of-care', 'diagnostics', 'rural health', 'community'],
    grantCall: 'NRIF-2025-HEALTH-002',
    submissionDate: '2025-04-03',
    documentUrl: 'proposal_007.pdf',
    status: 'PENDING',
    createdAt: '2025-04-03T09:00:00Z',
    similarityScore: 15,
  },
  {
    id: 'APP-2025-008',
    applicantName: 'Eng. Christian Habimana',
    institution: 'INES Ruhengeri',
    applicantType: 'University',
    email: 'c.habimana@ines.ac.rw',
    title: 'Solar-Powered Water Purification for Off-Grid Communities in Rwanda',
    abstract: 'Design and deployment of modular solar-powered water purification units for 20 off-grid communities in Northern and Western Rwanda. Each unit provides clean water for 500 households using photovoltaic-driven UV and membrane filtration, with remote monitoring via GSM telemetry.',
    keywords: ['solar', 'water purification', 'off-grid', 'community', 'Rwanda'],
    grantCall: 'NRIF-2025-PILOT-001',
    submissionDate: '2025-04-05',
    documentUrl: 'proposal_008.pdf',
    status: 'PENDING',
    createdAt: '2025-04-05T10:30:00Z',
    similarityScore: 22,
  },
  {
    id: 'APP-2025-009',
    applicantName: 'Dr. Alice Mukamana',
    institution: 'University of Rwanda',
    applicantType: 'University',
    email: 'a.mukamana@ur.ac.rw',
    title: 'Digital Health Literacy Program for Adolescents in Rwanda',
    abstract: 'A school-based digital health literacy intervention targeting 10,000 adolescents in Kigali and Huye districts. The program uses gamified mobile applications and peer educator networks to improve knowledge of sexual and reproductive health, mental health, and nutrition, with outcomes measured through validated digital surveys.',
    keywords: ['digital health', 'adolescents', 'literacy', 'education', 'mobile app'],
    grantCall: 'NRIF-2025-HEALTH-002',
    submissionDate: '2025-04-08',
    documentUrl: 'proposal_009.pdf',
    status: 'SCREENING',
    createdAt: '2025-04-08T14:00:00Z',
    similarityScore: 31,
  },
  {
    id: 'APP-2025-010',
    applicantName: 'Mr. Thierry Nshimiyimana',
    institution: 'Green Hills Academy',
    applicantType: 'NGO',
    email: 't.nshimiyimana@gha.rw',
    title: 'Urban Green Corridors for Climate Adaptation in Kigali City',
    abstract: 'Assessment of urban heat island effects in Kigali and design of green corridor networks using native tree species, green roofs, and permeable paving. The project produces an urban greening master plan integrated with Kigali\'s master plan revision, including cost-benefit analysis for municipal implementation.',
    keywords: ['urban greening', 'climate adaptation', 'Kigali', 'heat island', 'corridors'],
    grantCall: 'NRIF-2025-PILOT-001',
    submissionDate: '2025-04-10',
    documentUrl: 'proposal_010.pdf',
    status: 'PENDING',
    createdAt: '2025-04-10T11:00:00Z',
    similarityScore: 19,
  },
  {
    id: 'APP-2025-011',
    applicantName: 'Dr. Jean-Baptiste Gasana',
    institution: 'Rwanda Standards Board',
    applicantType: 'Government Agency',
    email: 'jb.gasana@rsb.gov.rw',
    title: 'Standardization of Traditional Rwandan Fermented Foods for Export Markets',
    abstract: 'Development of quality and safety standards for Rwanda\'s traditional fermented foods—including ikivuguto, urwagwa, and ikigage—to facilitate formal sector production and regional export. The study combines microbiological analysis, consumer studies, and stakeholder workshops to produce draft national standards aligned with Codex Alimentarius requirements.',
    keywords: ['food standards', 'fermented foods', 'export', 'quality', 'Rwanda'],
    grantCall: 'NRIF-2025-AGRI-003',
    submissionDate: '2025-04-12',
    documentUrl: 'proposal_011.pdf',
    status: 'INCOMPLETE',
    createdAt: '2025-04-12T09:30:00Z',
    similarityScore: 0,
  },
  {
    id: 'APP-2025-012',
    applicantName: 'Dr. Vestine Mukanzabigwi',
    institution: 'Kibagabaga Hospital',
    applicantType: 'Hospital/Health Facility',
    email: 'v.mukanzabigwi@kibagabaga.rw',
    title: 'Telemedicine Platform for Specialist Consultation in District Hospitals',
    abstract: 'Deployment of an integrated telemedicine platform connecting district hospitals with specialist physicians at King Faisal and CHUK. The system includes video consultation, digital referral management, and an AI triage assistant providing initial case assessments. Coverage targets 8 district hospitals with 200+ consultations per month within 12 months.',
    keywords: ['telemedicine', 'specialist', 'district hospital', 'triage', 'digital referral'],
    grantCall: 'NRIF-2025-HEALTH-002',
    submissionDate: '2025-04-15',
    documentUrl: 'proposal_012.pdf',
    status: 'PENDING',
    createdAt: '2025-04-15T13:30:00Z',
    similarityScore: 27,
  },
  {
    id: 'APP-2025-013',
    applicantName: 'Ms. Sandrine Ingabire',
    institution: 'One Acre Fund Rwanda',
    applicantType: 'NGO',
    email: 's.ingabire@oneacrefund.org',
    title: 'Crop Insurance Microfinance Models for Smallholder Resilience in Rwanda',
    abstract: 'Design and piloting of parametric crop insurance products linked to weather indices for smallholder maize and bean farmers in Eastern Province. Working with MFIs and Rwanda\'s Ministry of Finance, the project develops viable premium structures and claims mechanisms that align with Rwanda Vision 2050 financial inclusion targets.',
    keywords: ['crop insurance', 'microfinance', 'smallholder', 'parametric', 'weather index'],
    grantCall: 'NRIF-2025-AGRI-003',
    submissionDate: '2025-04-18',
    documentUrl: 'proposal_013.pdf',
    status: 'CLEARED',
    createdAt: '2025-04-18T10:00:00Z',
    similarityScore: 11,
  },
  {
    id: 'APP-2025-014',
    applicantName: 'Dr. Pierre Murenzi',
    institution: 'AMIR',
    applicantType: 'Research Institute',
    email: 'p.murenzi@amir.rw',
    title: 'Drone-Based Forest Cover Monitoring for Rwanda\'s Reforestation Program',
    abstract: 'A drone and satellite remote sensing system for continuous monitoring of Rwanda\'s national reforestation targets under the Landscape Restoration Program. The platform generates bi-monthly canopy cover maps, integrates with the Rwanda Forestry Authority GIS, and provides early warning for land degradation and illegal clearing.',
    keywords: ['drones', 'forest monitoring', 'remote sensing', 'reforestation', 'GIS'],
    grantCall: 'NRIF-2025-PILOT-001',
    submissionDate: '2025-04-20',
    documentUrl: 'proposal_014.pdf',
    status: 'NEEDS_REVIEW',
    createdAt: '2025-04-20T08:00:00Z',
    similarityScore: 56,
  },
  {
    id: 'APP-2025-015',
    applicantName: 'Dr. Epiphanie Nzamwita',
    institution: 'University of Rwanda',
    applicantType: 'University',
    email: 'e.nzamwita@ur.ac.rw',
    title: 'Blockchain Credential System for Rwandan Academic Institutions',
    abstract: 'Development of a permissioned blockchain network for issuing and verifying academic credentials across Rwandan universities and technical schools. The system uses Hyperledger Fabric to ensure tamper-proof records, enabling instant credential verification by employers and foreign institutions without central registry dependency.',
    keywords: ['blockchain', 'credentials', 'academic', 'verification', 'Hyperledger'],
    grantCall: 'NRIF-2025-PILOT-001',
    submissionDate: '2025-04-22',
    documentUrl: 'proposal_015.pdf',
    status: 'FLAGGED',
    createdAt: '2025-04-22T14:00:00Z',
    similarityScore: 84,
  },
];

export const MOCK_HISTORICAL_PROPOSALS: HistoricalProposal[] = [
  {
    id: 'hist-1',
    proposalId: 'NRIF-2024-001',
    title: 'AI Applications in Cassava Disease Management in Sub-Saharan Africa',
    abstract: 'This study explored the use of deep learning models for automated identification of cassava diseases including mosaic virus, brown streak, and bacterial blight across Uganda, Tanzania, and Rwanda. The project produced a mobile diagnostic tool with 92% accuracy on field-collected images.',
    keywords: ['cassava', 'disease', 'deep learning', 'Africa', 'mobile'],
    institution: 'Makerere University',
    applicantName: 'Dr. James Ogwal',
    grantYear: '2024',
    domain: 'Agriculture & Technology',
    status: 'Awarded',
  },
  {
    id: 'hist-2',
    proposalId: 'NRIF-2024-002',
    title: 'Genomic Approaches to Tracking Antibiotic Resistance in East African Hospitals',
    abstract: 'Whole-genome sequencing of resistant bacterial isolates from clinical samples collected across 8 regional hospitals in Kenya and Uganda, mapping resistance gene networks and informing regional stewardship protocols. Data were submitted to the WHO AMR surveillance platform.',
    keywords: ['AMR', 'whole-genome sequencing', 'antibiotics', 'hospitals', 'East Africa'],
    institution: 'KEMRI',
    applicantName: 'Dr. Faith Ochieng',
    grantYear: '2024',
    domain: 'Health Sciences',
    status: 'Awarded',
  },
  {
    id: 'hist-3',
    proposalId: 'NRIF-2024-003',
    title: 'Smart Water Management for Dryland Smallholders Using Sensor Networks',
    abstract: 'IoT-based soil moisture and weather monitoring systems deployed across smallholder plots in Kenya\'s semi-arid regions. The sensor network fed machine learning models for irrigation scheduling, reducing water usage by 38% while maintaining yields comparable to conventional irrigation.',
    keywords: ['IoT', 'soil moisture', 'irrigation scheduling', 'dryland', 'sensor'],
    institution: 'ICRAF',
    applicantName: 'Dr. Samuel Mwangi',
    grantYear: '2024',
    domain: 'Agriculture & Climate',
    status: 'Awarded',
  },
  {
    id: 'hist-4',
    proposalId: 'NRIF-2024-004',
    title: 'Decentralized Credential Verification Using Distributed Ledger Technology',
    abstract: 'A permissioned distributed ledger system for verifying academic and professional credentials in Kenya and Uganda. Credentials are cryptographically signed by issuing institutions and verified instantly by employers and immigration authorities without central registry lookups.',
    keywords: ['distributed ledger', 'credentials', 'blockchain', 'verification', 'education'],
    institution: 'Strathmore University',
    applicantName: 'Dr. Kevin Mwenda',
    grantYear: '2024',
    domain: 'Technology & Education',
    status: 'Awarded',
  },
  {
    id: 'hist-5',
    proposalId: 'NRIF-2024-005',
    title: 'Predictive Analytics for Malaria Hotspot Identification in East Africa',
    abstract: 'Ensemble machine learning models integrating climate reanalysis data, land cover changes, and historical malaria incidence to predict high-risk zones 4–8 weeks ahead. Models were validated in Uganda and Kenya with 78% spatial prediction accuracy at district level.',
    keywords: ['malaria', 'predictive analytics', 'hotspot', 'climate', 'machine learning'],
    institution: 'LSTM Liverpool',
    applicantName: 'Dr. Rachel Kimani',
    grantYear: '2024',
    domain: 'Health Sciences',
    status: 'Awarded',
  },
  {
    id: 'hist-6',
    proposalId: 'NRIF-2024-006',
    title: 'Soil Organic Carbon Dynamics Under Agroforestry in Volcanic Highland Soils',
    abstract: 'A five-year longitudinal study tracking soil organic carbon changes in volcanic highland soils under different agroforestry interventions. Results showed 2.1 tonnes C/ha/year sequestration under intensive agroforestry, informing CDM and voluntary carbon market protocols.',
    keywords: ['soil carbon', 'agroforestry', 'volcanic soils', 'highlands', 'carbon market'],
    institution: 'CIAT',
    applicantName: 'Dr. Peter Mwangi',
    grantYear: '2024',
    domain: 'Climate & Agriculture',
    status: 'Awarded',
  },
  {
    id: 'hist-7',
    proposalId: 'NRIF-2024-007',
    title: 'Telemedicine Services for Rural District Hospitals in East Africa',
    abstract: 'Implementation of telemedicine services connecting rural district hospitals with urban specialists via video consultation and asynchronous image sharing platforms. The program demonstrated 65% reduction in unnecessary referral travel and high patient satisfaction across 5 district hospitals.',
    keywords: ['telemedicine', 'rural', 'specialist', 'consultation', 'district hospital'],
    institution: 'Aga Khan University',
    applicantName: 'Dr. Amina Khalid',
    grantYear: '2024',
    domain: 'Health Sciences',
    status: 'Awarded',
  },
  {
    id: 'hist-8',
    proposalId: 'NRIF-2024-008',
    title: 'Satellite Remote Sensing for Forest Cover Change Detection in Great Lakes Region',
    abstract: 'Multi-temporal Landsat and Sentinel-2 analysis to map deforestation and reforestation dynamics across the Great Lakes region. A cloud-based GIS platform provides quarterly updates to national forestry authorities with automated alerts for illegal clearing events.',
    keywords: ['satellite', 'remote sensing', 'forest cover', 'deforestation', 'GIS'],
    institution: 'RCMRD',
    applicantName: 'Dr. Moses Kiptoo',
    grantYear: '2024',
    domain: 'Environment & Technology',
    status: 'Awarded',
  },
  {
    id: 'hist-9',
    proposalId: 'NRIF-2023-012',
    title: 'Mobile Health Platforms for Adolescent Sexual and Reproductive Health in Rwanda',
    abstract: 'Development and evaluation of a gamified mobile application for adolescent SRH education delivered through schools in Kigali. The app increased SRH knowledge scores by 42% and reduced misconceptions about contraception among 15–19-year-olds in a randomized controlled trial.',
    keywords: ['mobile health', 'adolescents', 'SRH', 'gamification', 'education'],
    institution: 'University of Rwanda',
    applicantName: 'Dr. Grace Murindahabi',
    grantYear: '2023',
    domain: 'Health & Education',
    status: 'Awarded',
  },
  {
    id: 'hist-10',
    proposalId: 'NRIF-2023-015',
    title: 'Parametric Insurance for Climate Risk Among Smallholder Farmers in Rwanda',
    abstract: 'Design and pilot testing of weather-indexed insurance products for 3,000 maize farmers in Rwamagana district. Claims triggers were linked to CHIRPS rainfall data and crop yield models, with MFI partnership for premium collection and payout disbursement via mobile money.',
    keywords: ['parametric insurance', 'weather index', 'climate risk', 'smallholder', 'maize'],
    institution: 'IFAD',
    applicantName: 'Dr. Josephine Uwera',
    grantYear: '2023',
    domain: 'Agriculture & Finance',
    status: 'Awarded',
  },
];

// Mock screening results for some applications
export const MOCK_SCREENING_RESULTS: Record<string, ScreeningResult> = {
  'APP-2025-001': {
    applicationId: 'APP-2025-001',
    eligibilityResult: 'PASS',
    eligibilityChecks: [
      { rule: 'Eligible applicant category', result: 'PASS', detail: 'University — eligible under NRIF-2025 guidelines' },
      { rule: 'Submission before deadline (April 30, 2025)', result: 'PASS', detail: 'Submitted March 15, 2025' },
      { rule: 'Proposal document attached', result: 'PASS', detail: 'PDF document present' },
      { rule: 'Required fields completed', result: 'PASS', detail: 'All mandatory fields present' },
      { rule: 'Applicable grant call', result: 'PASS', detail: 'NRIF-2025-AGRI-003 is open' },
    ],
    completenessResult: 'COMPLETE',
    missingItems: [],
    similarityScore: 12,
    similarProposals: [
      { proposalId: 'NRIF-2024-001', title: 'AI Applications in Cassava Disease Management in Sub-Saharan Africa', institution: 'Makerere University', year: '2024', similarityScore: 12, matchedConcepts: ['cassava', 'mobile', 'AI'] },
    ],
    textualOverlapStatus: 'NONE',
    textualOverlaps: [],
    aiSummary: 'A mobile AI platform for early cassava mosaic disease detection targeting Rwandan smallholder farmers using CNNs trained on local imagery, with Kinyarwanda voice support.',
    aiKeyConcepts: ['Convolutional neural networks', 'crop disease diagnostics', 'smallholder agriculture', 'Kinyarwanda localization', 'mobile AI'],
    aiResearchDomain: 'Agricultural Technology / Plant Pathology',
    aiRelevance: 'Highly relevant to NRIF-2025-AGRI-003 objectives: digital agriculture innovation, smallholder productivity, and local language accessibility.',
    aiConcerns: [],
    aiExplanation: 'The proposal presents a clearly scoped, locally relevant agricultural AI solution with realistic impact estimates. Methodology is sound and the Kinyarwanda interface demonstrates genuine localization commitment.',
    flags: [],
    humanReviewRequired: false,
    finalStatus: 'CLEARED_FOR_REVIEW',
    screenedAt: '2025-03-16T10:00:00Z',
    screenedBy: 'Jean-Paul Nkurunziza',
  },
  'APP-2025-006': {
    applicationId: 'APP-2025-006',
    eligibilityResult: 'PASS',
    eligibilityChecks: [
      { rule: 'Eligible applicant category', result: 'PASS', detail: 'University — eligible under NRIF-2025 guidelines' },
      { rule: 'Submission before deadline (April 30, 2025)', result: 'PASS', detail: 'Submitted April 1, 2025' },
      { rule: 'Proposal document attached', result: 'PASS', detail: 'PDF document present' },
      { rule: 'Required fields completed', result: 'PASS', detail: 'All mandatory fields present' },
      { rule: 'Applicable grant call', result: 'PASS', detail: 'NRIF-2025-PILOT-001 is open' },
    ],
    completenessResult: 'COMPLETE',
    missingItems: [],
    similarityScore: 84,
    similarProposals: [
      { proposalId: 'NRIF-2024-004', title: 'Decentralized Credential Verification Using Distributed Ledger Technology', institution: 'Strathmore University', year: '2024', similarityScore: 84, matchedConcepts: ['blockchain', 'credentials', 'verification', 'education', 'distributed ledger'] },
      { proposalId: 'NRIF-2024-003', title: 'Smart Water Management for Dryland Smallholders Using Sensor Networks', institution: 'ICRAF', year: '2024', similarityScore: 11, matchedConcepts: ['IoT', 'network'] },
    ],
    textualOverlapStatus: 'POTENTIAL_OVERLAP',
    textualOverlaps: [
      {
        section: 'Abstract',
        submittedText: 'A decentralized blockchain system for issuing and verifying academic credentials across East African universities, reducing credential fraud and streamlining cross-border professional recognition.',
        sourceText: 'A permissioned distributed ledger system for verifying academic and professional credentials in Kenya and Uganda. Credentials are cryptographically signed by issuing institutions and verified instantly by employers.',
        sourceProposalId: 'NRIF-2024-004',
        indicator: 79,
      },
    ],
    aiSummary: 'Blockchain-based academic credential verification for East African universities with focus on Rwanda Polytechnic as pilot institution.',
    aiKeyConcepts: ['Blockchain', 'credential verification', 'academic fraud prevention', 'EAC regional framework', 'decentralized systems'],
    aiResearchDomain: 'Educational Technology / Distributed Systems',
    aiRelevance: 'Relevant to NRIF-2025-PILOT-001 innovation mandate. However, high similarity with previously awarded NRIF-2024-004 warrants careful review to ensure substantial differentiation.',
    aiConcerns: ['High semantic similarity with NRIF-2024-004 (Strathmore University, 2024)', 'Abstract wording closely matches prior awarded proposal', 'Insufficient differentiation from prior work described in literature review'],
    aiExplanation: 'The AI analysis identifies substantial conceptual and textual overlap with NRIF-2024-004. The core innovation claim of blockchain credential verification appears to duplicate an already-funded project. Human review is essential to determine whether sufficient novelty exists to justify separate funding.',
    flags: ['High semantic similarity (84%) with NRIF-2024-004', 'Potential textual overlap in abstract section', 'Similarity indicator requires human verification'],
    humanReviewRequired: true,
    finalStatus: 'NEEDS_HUMAN_REVIEW',
    screenedAt: '2025-04-02T14:00:00Z',
    screenedBy: 'Jean-Paul Nkurunziza',
  },
};

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', userId: 'u2', userName: 'Jean-Paul Nkurunziza', applicationId: 'APP-2025-001', action: 'CLEARED', previousStatus: 'SCREENING', newStatus: 'CLEARED', timestamp: '2025-03-16T10:30:00Z', notes: 'All checks passed. Cleared for scientific review committee.' },
  { id: 'log-2', userId: 'u2', userName: 'Jean-Paul Nkurunziza', applicationId: 'APP-2025-006', action: 'FLAGGED', previousStatus: 'SCREENING', newStatus: 'FLAGGED', timestamp: '2025-04-02T14:45:00Z', notes: 'High similarity with NRIF-2024-004. Flagged for senior officer review.' },
  { id: 'log-3', userId: 'u2', userName: 'Jean-Paul Nkurunziza', applicationId: 'APP-2025-005', action: 'CLEARED', previousStatus: 'SCREENING', newStatus: 'CLEARED', timestamp: '2025-03-29T09:15:00Z' },
  { id: 'log-4', userId: 'u2', userName: 'Jean-Paul Nkurunziza', applicationId: 'APP-2025-013', action: 'CLEARED', previousStatus: 'SCREENING', newStatus: 'CLEARED', timestamp: '2025-04-19T11:00:00Z' },
];
