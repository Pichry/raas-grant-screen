import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || 'raas-dev-secret-change-in-production';
const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'raas.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    applicantId TEXT,
    applicantName TEXT NOT NULL,
    institution TEXT NOT NULL,
    applicantType TEXT NOT NULL,
    email TEXT NOT NULL,
    title TEXT NOT NULL,
    abstract TEXT NOT NULL,
    keywords TEXT NOT NULL,
    grantCall TEXT NOT NULL,
    submissionDate TEXT NOT NULL,
    documentUrl TEXT,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    similarityScore REAL,
    eligibilityResult TEXT,
    eligibilityMessage TEXT,
    eligibilityPublishedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS screening_results (
    applicationId TEXT PRIMARY KEY,
    payload TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    payload TEXT NOT NULL
  );
`);

const applicationColumns = db.prepare('PRAGMA table_info(applications)').all().map(column => column.name);
for (const columnName of ['eligibilityResult', 'eligibilityMessage', 'eligibilityPublishedAt']) {
  if (!applicationColumns.includes(columnName)) {
    db.exec(`ALTER TABLE applications ADD COLUMN ${columnName} TEXT`);
  }
}

const defaultUsers = [
  { id: 'u1', name: 'Dr. Amina Uwase', email: 'admin@raas.rw', role: 'ADMIN', password: 'Admin2025!' },
  { id: 'u2', name: 'Jean de Dieu Ndayambaje', email: 'officer@raas.rw', role: 'GRANT_OFFICER', password: 'Officer2025!' },
  { id: 'u3', name: 'Marie Claire Mukamana', email: 'applicant@raas.rw', role: 'APPLICANT', password: 'Applicant2025!' },
  { id: 'u4', name: 'Samuel Mugisha', email: 'officer2@raas.rw', role: 'GRANT_OFFICER', password: 'Officer2025!' },
  { id: 'u5', name: 'Fidele Nshuti', email: 'applicant2@raas.rw', role: 'APPLICANT', password: 'Applicant2025!' },
  { id: 'u6', name: 'Alice Uwera', email: 'applicant3@raas.rw', role: 'APPLICANT', password: 'Applicant2025!' },
];

const insertUser = db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?) ON CONFLICT(email) DO UPDATE SET name = excluded.name, password_hash = excluded.password_hash, role = excluded.role');
for (const user of defaultUsers) {
  insertUser.run(user.id, user.name, user.email, bcrypt.hashSync(user.password, 10), user.role);
}

const seedApplications = [
  {
    id: 'APP-2025-001',
    applicantId: 'u3',
    applicantName: 'Marie Claire Mukamana',
    institution: 'University of Rwanda',
    applicantType: 'University',
    email: 'applicant@raas.rw',
    title: 'AI-Driven Early Detection of Cassava Mosaic Disease in Rwanda',
    abstract: 'This research proposes a mobile-based AI screening system for cassava mosaic disease in Rwanda’s major cassava-producing districts. The model uses smartphone-captured leaf imagery and convolutional neural networks to detect early-stage disease symptoms, helping smallholder farmers reduce losses while improving extension services and data visibility for local agronomists.',
    keywords: ['cassava', 'disease detection', 'AI', 'agriculture', 'mobile'],
    grantCall: 'NRIF-2025-AGRI-003',
    submissionDate: '2025-03-15',
    documentUrl: 'proposal_001.pdf',
    status: 'CLEARED',
    createdAt: '2025-03-15T09:30:00Z',
    similarityScore: 12,
    eligibilityResult: 'PASS',
    eligibilityMessage: 'Your application is eligible for funding consideration and has been approved for the next review stage.',
    eligibilityPublishedAt: '2025-03-18T14:00:00Z',
  },
  {
    id: 'APP-2025-002',
    applicantId: 'u5',
    applicantName: 'Fidele Nshuti',
    institution: 'Rwanda Biomedical Centre',
    applicantType: 'Research Institute',
    email: 'applicant2@raas.rw',
    title: 'Genomic Surveillance of Antimicrobial Resistance in Rwandan Health Facilities',
    abstract: 'This project aims to build a nationwide genomic surveillance framework for monitoring antimicrobial resistance patterns in selected district hospitals. It combines routine laboratory sample collection, sequencing workflows, and dashboards to help the Ministry of Health prioritize treatment policies and infection control actions.',
    keywords: ['AMR', 'genomics', 'surveillance', 'health', 'public health'],
    grantCall: 'NRIF-2025-HEALTH-002',
    submissionDate: '2025-03-20',
    documentUrl: 'proposal_002.pdf',
    status: 'NEEDS_REVIEW',
    createdAt: '2025-03-20T14:15:00Z',
    similarityScore: 67,
    eligibilityResult: 'REVIEW',
    eligibilityMessage: 'Your application requires additional review before an eligibility determination can be finalized.',
    eligibilityPublishedAt: '2025-03-23T09:00:00Z',
  },
  {
    id: 'APP-2025-003',
    applicantId: 'u6',
    applicantName: 'Alice Uwera',
    institution: 'Youth Innovation Lab Rwanda',
    applicantType: 'NGO',
    email: 'applicant3@raas.rw',
    title: 'Digital Skills Bootcamp for Young Women in Green Technology',
    abstract: 'The proposed program will train young women from Kigali and secondary cities in digital literacy and climate-smart technology skills. Learners will build practical prototypes in renewable energy, e-waste recycling, and mobile agriculture solutions while receiving mentorship and career placement support.',
    keywords: ['youth', 'digital skills', 'climate', 'innovation', 'women'],
    grantCall: 'NRIF-2025-EDU-001',
    submissionDate: '2025-04-05',
    documentUrl: 'proposal_003.pdf',
    status: 'UNDER_REVIEW',
    createdAt: '2025-04-05T11:00:00Z',
    similarityScore: 41,
    eligibilityResult: 'REVIEW',
    eligibilityMessage: 'Your application is under review and will receive an eligibility result after the technical screening committee assessment is completed.',
    eligibilityPublishedAt: '2025-04-07T12:15:00Z',
  },
  {
    id: 'APP-2025-004',
    applicantId: 'u3',
    applicantName: 'Marie Claire Mukamana',
    institution: 'Kigali Independent University',
    applicantType: 'University',
    email: 'applicant@raas.rw',
    title: 'Smart Irrigation Advisory Platform for Smallholder Farmers in Eastern Rwanda',
    abstract: 'This project will develop a low-cost irrigation advisory platform that combines rainfall forecasting, soil conditions, and crop water requirements to guide farmers on when and how much to irrigate. The solution is designed for low-bandwidth mobile access and community extension agents.',
    keywords: ['irrigation', 'water management', 'farmers', 'AI', 'climate'],
    grantCall: 'NRIF-2025-AGRI-007',
    submissionDate: '2025-04-18',
    documentUrl: 'proposal_004.pdf',
    status: 'DRAFT',
    createdAt: '2025-04-18T08:20:00Z',
    similarityScore: null,
  },
];

const insertApplication = db.prepare('INSERT INTO applications (id, applicantId, applicantName, institution, applicantType, email, title, abstract, keywords, grantCall, submissionDate, documentUrl, status, createdAt, similarityScore, eligibilityResult, eligibilityMessage, eligibilityPublishedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET applicantId = excluded.applicantId, applicantName = excluded.applicantName, institution = excluded.institution, applicantType = excluded.applicantType, email = excluded.email, title = excluded.title, abstract = excluded.abstract, keywords = excluded.keywords, grantCall = excluded.grantCall, submissionDate = excluded.submissionDate, documentUrl = excluded.documentUrl, status = excluded.status, createdAt = excluded.createdAt, similarityScore = excluded.similarityScore, eligibilityResult = excluded.eligibilityResult, eligibilityMessage = excluded.eligibilityMessage, eligibilityPublishedAt = excluded.eligibilityPublishedAt');
for (const app of seedApplications) {
  insertApplication.run(
    app.id,
    app.applicantId,
    app.applicantName,
    app.institution,
    app.applicantType,
    app.email,
    app.title,
    app.abstract,
    JSON.stringify(app.keywords),
    app.grantCall,
    app.submissionDate,
    app.documentUrl,
    app.status,
    app.createdAt,
    app.similarityScore ?? null,
    app.eligibilityResult ?? null,
    app.eligibilityMessage ?? null,
    app.eligibilityPublishedAt ?? null,
  );
}

const sanitizeUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });
const signToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '8h' });

const buildLocalScreeningAnalysis = (app, historicalProposals = []) => {
  const keywords = new Set((app.keywords || []).map((k) => String(k).toLowerCase()));
  const eligibilityChecks = [
    {
      rule: 'Eligible applicant category',
      result: ['University', 'Research Institute', 'Government Agency', 'Hospital/Health Facility'].includes(app.applicantType) ? 'PASS' : 'REVIEW',
      detail: `${app.applicantType} — ${['University', 'Research Institute', 'Government Agency', 'Hospital/Health Facility'].includes(app.applicantType) ? 'eligible' : 'requires category review'} under NRIF-2025 guidelines`,
    },
    {
      rule: 'Submission before deadline (April 30, 2025)',
      result: new Date(app.submissionDate) <= new Date('2025-04-30') ? 'PASS' : 'FAIL',
      detail: `Submitted ${new Date(app.submissionDate).toLocaleDateString('en-RW', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    },
    {
      rule: 'Proposal document attached',
      result: app.documentUrl ? 'PASS' : 'FAIL',
      detail: app.documentUrl ? `Document: ${app.documentUrl}` : 'No proposal document attached',
    },
    {
      rule: 'Required fields completed',
      result: app.abstract && app.title && app.email && app.applicantName && app.institution ? 'PASS' : 'FAIL',
      detail: 'All mandatory fields verified',
    },
    {
      rule: 'Applicable grant call',
      result: 'PASS',
      detail: `${app.grantCall} is active`,
    },
  ];

  const eligibilityResult = eligibilityChecks.some((check) => check.result === 'FAIL')
    ? 'FAIL'
    : eligibilityChecks.some((check) => check.result === 'REVIEW')
      ? 'REVIEW'
      : 'PASS';

  const missingItems = [];
  if (!app.documentUrl) missingItems.push('Proposal document (PDF)');
  if (!app.abstract || app.abstract.split(/\s+/).length < 50) missingItems.push('Abstract (minimum 100 words recommended)');
  if (!(app.keywords || []).length) missingItems.push('Keywords');
  const completenessResult = missingItems.length > 0 ? 'INCOMPLETE' : 'COMPLETE';

  const similarProposals = historicalProposals
    .map((historical) => {
      const historicalKeywords = new Set((historical.keywords || []).map((k) => String(k).toLowerCase()));
      const intersection = [...keywords].filter((k) => historicalKeywords.has(k)).length;
      const union = new Set([...keywords, ...historicalKeywords]).size;
      const jaccardScore = union > 0 ? Math.round((intersection / union) * 100) : 0;
      const titleWords = new Set(String(app.title || '').toLowerCase().split(/\s+/));
      const historicalTitleWords = new Set(String(historical.title || '').toLowerCase().split(/\s+/));
      const titleSimilarity = [...titleWords].filter((word) => historicalTitleWords.has(word) && word.length > 3).length;
      const combined = Math.min(100, jaccardScore + titleSimilarity * 5);

      return {
        proposalId: historical.proposalId,
        title: historical.title,
        institution: historical.institution,
        year: historical.grantYear,
        similarityScore: combined,
        matchedConcepts: [...keywords].filter((k) => historicalKeywords.has(k)).slice(0, 5),
      };
    })
    .filter((proposal) => proposal.similarityScore > 5)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 3);

  const topScore = similarProposals[0]?.similarityScore ?? 0;
  const textualOverlaps = [];
  if (topScore >= 60 && similarProposals[0]) {
    const source = historicalProposals.find((proposal) => proposal.proposalId === similarProposals[0].proposalId);
    textualOverlaps.push({
      section: 'Abstract',
      submittedText: String(app.abstract || '').slice(0, 180) + '…',
      sourceText: source?.abstract ? String(source.abstract).slice(0, 180) + '…' : '',
      sourceProposalId: similarProposals[0].proposalId,
      indicator: topScore,
    });
  }

  const flags = [];
  if (topScore >= 70) flags.push(`High semantic similarity (${topScore}%) with ${similarProposals[0]?.proposalId}`);
  if (textualOverlaps.length > 0) flags.push('Potential textual overlap — human verification required');
  if (completenessResult === 'INCOMPLETE') flags.push(`Missing: ${missingItems.join(', ')}`);
  if (eligibilityResult === 'FAIL') flags.push('Eligibility check failed');

  const humanReviewRequired = flags.length > 0;
  const finalStatus = completenessResult === 'INCOMPLETE'
    ? 'INCOMPLETE'
    : humanReviewRequired
      ? 'NEEDS_HUMAN_REVIEW'
      : 'CLEARED_FOR_REVIEW';

  return {
    applicationId: app.id,
    eligibilityResult,
    eligibilityChecks,
    completenessResult,
    missingItems,
    similarityScore: topScore,
    similarProposals,
    textualOverlapStatus: textualOverlaps.length > 0 ? 'POTENTIAL_OVERLAP' : 'NONE',
    textualOverlaps,
    aiSummary: `[AI ADVISORY] This proposal explores ${(app.keywords || []).slice(0, 2).join(' and ')} in the context of ${app.grantCall}. The research appears to target ${app.institution}-based implementation with a focus on Rwanda-related priorities.`,
    aiKeyConcepts: (app.keywords || []).slice(0, 5),
    aiResearchDomain: (app.keywords || [])[0] ?? 'General Research',
    aiRelevance: `The proposal aligns with the stated goals of ${app.grantCall}. Key concepts are relevant to Rwanda's research priorities.`,
    aiConcerns: topScore >= 70 ? ['High similarity with previously funded or reviewed work — differentiation should be clarified by a human officer.'] : [],
    aiExplanation: 'AI findings are advisory. A human grant officer must verify the proposal, historical similarity, and any potential overlap before making a final decision.',
    flags,
    humanReviewRequired,
    finalStatus,
    screenedAt: new Date().toISOString(),
    screenedBy: 'AI Advisory Layer',
  };
};

const AI_PROVIDER = process.env.AI_PROVIDER || process.env.VITE_AI_PROVIDER || 'local-demo';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_BASE_URL = (process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, '');
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

const requireRole = (roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'You do not have permission to access this resource.' });
  }
  next();
};

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'RAAS API is running' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).trim().toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = bcrypt.compareSync(String(password), user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  return res.json({ user: sanitizeUser(user), token: signToken(user) });
});

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existing = db.prepare('SELECT 1 FROM users WHERE email = ?').get(normalizedEmail);
  if (existing) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const user = {
    id: `app-${Date.now()}`,
    name: String(name).trim(),
    email: normalizedEmail,
    role: 'APPLICANT',
  };

  db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)').run(
    user.id,
    user.name,
    user.email,
    bcrypt.hashSync(String(password), 10),
    user.role,
  );

  return res.status(201).json({ user, token: signToken(user) });
});

app.get('/api/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  return res.json({ user: sanitizeUser(user) });
});

app.post('/api/ai/screening', requireAuth, requireRole(['ADMIN', 'GRANT_OFFICER']), async (req, res) => {
  const { app, historicalProposals = [] } = req.body || {};
  if (!app || !app.id || !app.title) {
    return res.status(400).json({ error: 'Application payload is required.' });
  }

  try {
    if (AI_PROVIDER === 'local-demo' || !OPENAI_API_KEY) {
      return res.json(buildLocalScreeningAnalysis(app, historicalProposals));
    }

    const aiResponse = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: 'You are a grant screening assistant for Rwanda innovation proposals. Return strict JSON only with no markdown. Include eligibilityResult, eligibilityChecks, completenessResult, missingItems, similarityScore, similarProposals, textualOverlapStatus, textualOverlaps, aiSummary, aiKeyConcepts, aiResearchDomain, aiRelevance, aiConcerns, aiExplanation, flags, humanReviewRequired, finalStatus.',
          },
          {
            role: 'user',
            content: JSON.stringify({ app, historicalProposals }),
          },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(errorText || 'AI provider request failed.');
    }

    const data = await aiResponse.json();
    const content = data.choices?.[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(content);

    return res.json({
      applicationId: app.id,
      eligibilityResult: parsed.eligibilityResult || 'REVIEW',
      eligibilityChecks: parsed.eligibilityChecks || [],
      completenessResult: parsed.completenessResult || 'COMPLETE',
      missingItems: parsed.missingItems || [],
      similarityScore: Number(parsed.similarityScore ?? 0),
      similarProposals: parsed.similarProposals || [],
      textualOverlapStatus: parsed.textualOverlapStatus || 'NONE',
      textualOverlaps: parsed.textualOverlaps || [],
      aiSummary: parsed.aiSummary || 'AI summary pending verification.',
      aiKeyConcepts: parsed.aiKeyConcepts || [],
      aiResearchDomain: parsed.aiResearchDomain || 'General Research',
      aiRelevance: parsed.aiRelevance || 'Pending verification.',
      aiConcerns: parsed.aiConcerns || [],
      aiExplanation: parsed.aiExplanation || 'Human review required.',
      flags: parsed.flags || [],
      humanReviewRequired: Boolean(parsed.humanReviewRequired),
      finalStatus: parsed.finalStatus || 'NEEDS_HUMAN_REVIEW',
      screenedAt: new Date().toISOString(),
      screenedBy: 'OpenAI Model',
    });
  } catch (error) {
    console.error('AI screening error:', error);
    return res.json(buildLocalScreeningAnalysis(app, historicalProposals));
  }
});

app.get('/api/data', requireAuth, (req, res) => {
  const users = db.prepare('SELECT id, name, email, role FROM users ORDER BY name').all().map(sanitizeUser);

  const baseApplications = db.prepare('SELECT * FROM applications ORDER BY createdAt DESC').all().map((row) => ({
    ...row,
    keywords: JSON.parse(row.keywords || '[]'),
    eligibilityResult: row.eligibilityResult ?? undefined,
    eligibilityMessage: row.eligibilityMessage ?? undefined,
    eligibilityPublishedAt: row.eligibilityPublishedAt ?? undefined,
  }));

  const applications = req.user.role === 'APPLICANT'
    ? baseApplications.filter((app) => app.email.toLowerCase() === req.user.email.toLowerCase() || app.applicantId === req.user.id)
    : baseApplications;

  const screeningRows = db.prepare('SELECT * FROM screening_results ORDER BY applicationId').all();
  const screeningResults = screeningRows.reduce((acc, row) => {
    acc[row.applicationId] = JSON.parse(row.payload || '{}');
    return acc;
  }, {});

  const auditRows = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC').all().map((row) => JSON.parse(row.payload || '{}'));

  res.json({ users, applications, screeningResults, auditLogs: auditRows });
});

app.post('/api/applications', requireAuth, requireRole(['ADMIN', 'GRANT_OFFICER', 'APPLICANT']), (req, res) => {
  const app = req.body;
  if (!app || !app.id || !app.title) {
    return res.status(400).json({ error: 'Application body is invalid.' });
  }

  if (req.user.role === 'APPLICANT' && (app.email || '').toLowerCase() !== req.user.email.toLowerCase()) {
    return res.status(403).json({ error: 'Applicants can only submit their own applications.' });
  }

  const exists = db.prepare('SELECT 1 FROM applications WHERE id = ?').get(app.id);
  if (exists) {
    return res.status(409).json({ error: 'Application already exists.' });
  }

  db.prepare(
    'INSERT INTO applications (id, applicantId, applicantName, institution, applicantType, email, title, abstract, keywords, grantCall, submissionDate, documentUrl, status, createdAt, similarityScore) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(
    app.id,
    app.applicantId ?? req.user.id,
    app.applicantName,
    app.institution,
    app.applicantType,
    app.email,
    app.title,
    app.abstract,
    JSON.stringify(app.keywords || []),
    app.grantCall,
    app.submissionDate,
    app.documentUrl ?? null,
    app.status || 'DRAFT',
    app.createdAt || new Date().toISOString(),
    app.similarityScore ?? null,
  );

  res.status(201).json({ success: true, application: app });
});

app.patch('/api/applications/:id/status', requireAuth, requireRole(['ADMIN', 'GRANT_OFFICER']), (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'Status is required.' });

  const result = db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(String(status), req.params.id);
  res.json({ success: true, changes: result.changes });
});

app.patch('/api/applications/:id/eligibility', requireAuth, requireRole(['ADMIN', 'GRANT_OFFICER']), (req, res) => {
  const { eligibilityResult, eligibilityMessage } = req.body || {};
  const allowed = ['PASS', 'FAIL', 'REVIEW', 'PENDING'];
  if (!eligibilityResult || !allowed.includes(eligibilityResult)) {
    return res.status(400).json({ error: 'A valid eligibilityResult is required.' });
  }

  const nextStatus = eligibilityResult === 'PASS'
    ? 'CLEARED'
    : eligibilityResult === 'FAIL'
    ? 'FLAGGED'
    : eligibilityResult === 'REVIEW'
    ? 'NEEDS_REVIEW'
    : 'PENDING';

  const publishedAt = new Date().toISOString();
  const result = db.prepare(
    'UPDATE applications SET status = ?, eligibilityResult = ?, eligibilityMessage = ?, eligibilityPublishedAt = ? WHERE id = ?',
  ).run(nextStatus, String(eligibilityResult), String(eligibilityMessage || 'An eligibility decision has been published to the applicant.'), publishedAt, req.params.id);

  res.json({ success: true, changes: result.changes, publishedAt });
});

app.post('/api/screening-results', requireAuth, requireRole(['ADMIN', 'GRANT_OFFICER']), (req, res) => {
  const payload = req.body;
  if (!payload || !payload.applicationId) {
    return res.status(400).json({ error: 'screening result requires applicationId.' });
  }

  db.prepare('INSERT INTO screening_results (applicationId, payload) VALUES (?, ?) ON CONFLICT(applicationId) DO UPDATE SET payload = excluded.payload').run(
    payload.applicationId,
    JSON.stringify(payload),
  );

  res.status(201).json({ success: true });
});

app.post('/api/audit-logs', requireAuth, requireRole(['ADMIN', 'GRANT_OFFICER']), (req, res) => {
  const payload = req.body;
  if (!payload || !payload.id) {
    return res.status(400).json({ error: 'audit log requires an id.' });
  }

  db.prepare('INSERT INTO audit_logs (id, payload) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET payload = excluded.payload').run(
    payload.id,
    JSON.stringify(payload),
  );

  res.status(201).json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`RAAS API listening on http://0.0.0.0:${PORT}`);
});
