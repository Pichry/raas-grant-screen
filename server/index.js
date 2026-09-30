import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'node:fs';
import path from 'node:path';

const app = express();
const PORT = Number(process.env.PORT || 4000);
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
    similarityScore REAL
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

const defaultUsers = [
  { id: 'u1', name: 'Dr. Amina Uwase', email: 'admin@raas.rw', role: 'ADMIN', password: 'Admin2025!' },
  { id: 'u2', name: 'Jean-Paul Nkurunziza', email: 'officer@raas.rw', role: 'GRANT_OFFICER', password: 'Officer2025!' },
  { id: 'u3', name: 'Marie Mukamana', email: 'applicant@raas.rw', role: 'APPLICANT', password: 'Applicant2025!' },
];

const usersCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
if (!usersCount) {
  const insertUser = db.prepare('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)');
  for (const user of defaultUsers) {
    insertUser.run(user.id, user.name, user.email, bcrypt.hashSync(user.password, 10), user.role);
  }
}

const seedApplications = [
  {
    id: 'APP-2025-001',
    applicantId: 'u3',
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
    applicantId: 'u3',
    applicantName: 'Prof. Emmanuel Habimana',
    institution: 'Rwanda Biomedical Centre',
    applicantType: 'Research Institute',
    email: 'e.habimana@rbc.gov.rw',
    title: 'Genomic Surveillance of Antimicrobial Resistance in Rwandan Health Facilities',
    abstract: 'A comprehensive genomic surveillance program to track antimicrobial resistance patterns across 12 districts.',
    keywords: ['AMR', 'genomics', 'surveillance', 'health'],
    grantCall: 'NRIF-2025-HEALTH-002',
    submissionDate: '2025-03-20',
    documentUrl: 'proposal_002.pdf',
    status: 'NEEDS_REVIEW',
    createdAt: '2025-03-20T14:15:00Z',
    similarityScore: 67,
  },
];

const applicationsCount = db.prepare('SELECT COUNT(*) AS count FROM applications').get().count;
if (!applicationsCount) {
  const insert = db.prepare('INSERT INTO applications (id, applicantId, applicantName, institution, applicantType, email, title, abstract, keywords, grantCall, submissionDate, documentUrl, status, createdAt, similarityScore) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  for (const app of seedApplications) {
    insert.run(
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
    );
  }
}

const sanitizeUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

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

  return res.json({ user: sanitizeUser(user) });
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

  return res.status(201).json({ user });
});

app.get('/api/data', (_req, res) => {
  const users = db.prepare('SELECT id, name, email, role FROM users ORDER BY name').all().map(sanitizeUser);
  const applications = db.prepare('SELECT * FROM applications ORDER BY createdAt DESC').all().map((row) => ({
    ...row,
    keywords: JSON.parse(row.keywords || '[]'),
  }));

  const screeningRows = db.prepare('SELECT * FROM screening_results ORDER BY applicationId').all();
  const screeningResults = screeningRows.reduce((acc, row) => {
    acc[row.applicationId] = JSON.parse(row.payload || '{}');
    return acc;
  }, {});

  const auditRows = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC').all().map((row) => JSON.parse(row.payload || '{}'));

  res.json({ users, applications, screeningResults, auditLogs: auditRows });
});

app.post('/api/applications', (req, res) => {
  const app = req.body;
  if (!app || !app.id || !app.title) {
    return res.status(400).json({ error: 'Application body is invalid.' });
  }

  const exists = db.prepare('SELECT 1 FROM applications WHERE id = ?').get(app.id);
  if (exists) {
    return res.status(409).json({ error: 'Application already exists.' });
  }

  db.prepare(
    'INSERT INTO applications (id, applicantId, applicantName, institution, applicantType, email, title, abstract, keywords, grantCall, submissionDate, documentUrl, status, createdAt, similarityScore) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
  ).run(
    app.id,
    app.applicantId ?? null,
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

app.patch('/api/applications/:id/status', (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'Status is required.' });

  const result = db.prepare('UPDATE applications SET status = ? WHERE id = ?').run(String(status), req.params.id);
  res.json({ success: true, changes: result.changes });
});

app.post('/api/screening-results', (req, res) => {
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

app.post('/api/audit-logs', (req, res) => {
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
