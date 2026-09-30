import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, PlusCircle, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAppData } from '@/context/AppDataContext';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/components/Toast';
import { Application, ApplicantType, GRANT_CALLS } from '@/data/mockData';

const APPLICANT_TYPES: ApplicantType[] = [
  'University', 'Research Institute', 'NGO', 'Government Agency', 'Private Sector', 'Hospital/Health Facility',
];

export function SubmitApplication() {
  const { addApplication } = useAppData();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    applicantName: '',
    institution: '',
    applicantType: '' as ApplicantType | '',
    email: '',
    title: '',
    abstract: '',
    keywords: '',
    grantCall: '',
    submissionDate: new Date().toISOString().slice(0, 10),
  });
  const [fileName, setFileName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [newAppId, setNewAppId] = useState('');

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') { toast('error', 'Only PDF files are accepted.'); return; }
      if (file.size > 10 * 1024 * 1024) { toast('error', 'File must be under 10 MB.'); return; }
      setFileName(file.name);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.applicantType || !form.grantCall) { toast('error', 'Please fill all required fields.'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));

    const count = Date.now().toString().slice(-3);
    const id = `APP-2025-${count}`;
    const app: Application = {
      id,
      applicantName: form.applicantName,
      institution: form.institution,
      applicantType: form.applicantType as ApplicantType,
      email: form.email,
      title: form.title,
      abstract: form.abstract,
      keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
      grantCall: form.grantCall,
      submissionDate: form.submissionDate,
      documentUrl: fileName || undefined,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      similarityScore: 0,
    };
    addApplication(app);
    setNewAppId(id);
    setSubmitting(false);
    setSubmitted(true);
    toast('success', `Application ${id} submitted successfully.`);
  };

  if (submitted) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 max-w-md w-full text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'var(--font-display)' }}>Application Submitted</h2>
          <p className="text-slate-600 text-sm mb-2">Your application has been received and is pending screening.</p>
          <div className="font-mono text-blue-700 bg-blue-50 px-4 py-2 rounded-lg mb-6 text-sm font-bold">{newAppId}</div>
          <div className="flex gap-3">
            <button onClick={() => navigate(`/applications/${newAppId}`)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">
              View Application
            </button>
            <button onClick={() => { setSubmitted(false); setForm({ applicantName: '', institution: '', applicantType: '', email: '', title: '', abstract: '', keywords: '', grantCall: '', submissionDate: new Date().toISOString().slice(0, 10) }); setFileName(''); }}
              className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{t('submit_application')}</h1>
        <p className="text-slate-500 text-sm mt-1">NRIF 2025 Grant Application Submission Form</p>
      </div>

      <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg">
        <AlertTriangle size={15} className="text-blue-500 shrink-0" />
        <p className="text-xs text-blue-800">Demo mode: uploaded documents are not stored on a server. Submission is simulated.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Applicant */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3" style={{ fontFamily: 'var(--font-display)' }}>
            1. Applicant Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Applicant Name *</label>
              <input required value={form.applicantName} onChange={e => set('applicantName', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dr. Jane Smith" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Institution *</label>
              <input required value={form.institution} onChange={e => set('institution', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="University of Rwanda" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Applicant Type *</label>
              <select required value={form.applicantType} onChange={e => set('applicantType', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select type…</option>
                {APPLICANT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
              <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="researcher@institution.rw" />
            </div>
          </div>
        </div>

        {/* Section 2: Proposal */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3" style={{ fontFamily: 'var(--font-display)' }}>
            2. Proposal Details
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Proposal Title *</label>
            <input required value={form.title} onChange={e => set('title', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. AI-Based Malaria Prediction System for Rwanda" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Abstract * <span className="font-normal text-slate-400">(min 100 words)</span></label>
            <textarea required value={form.abstract} onChange={e => set('abstract', e.target.value)} rows={6}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
              placeholder="Describe your research proposal, objectives, methodology, and expected outcomes…" />
            <div className="text-right text-xs text-slate-400 mt-1">{form.abstract.split(/\s+/).filter(Boolean).length} words</div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Keywords * <span className="font-normal text-slate-400">(comma-separated)</span></label>
            <input required value={form.keywords} onChange={e => set('keywords', e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="machine learning, agriculture, Rwanda, crop disease" />
          </div>
        </div>

        {/* Section 3: Grant call & date */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3" style={{ fontFamily: 'var(--font-display)' }}>
            3. Grant Call & Submission
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Grant Call *</label>
              <select required value={form.grantCall} onChange={e => set('grantCall', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Select grant call…</option>
                {GRANT_CALLS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Submission Date *</label>
              <input required type="date" value={form.submissionDate} onChange={e => set('submissionDate', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>

        {/* Section 4: Documents */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3" style={{ fontFamily: 'var(--font-display)' }}>
            4. Required Documents
          </h2>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">Proposal Document (PDF, max 10 MB) *</label>
            <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
              <Upload size={24} className={fileName ? 'text-green-500' : 'text-slate-400'} />
              {fileName ? (
                <div className="text-center">
                  <div className="text-sm font-medium text-green-700">{fileName}</div>
                  <div className="text-xs text-green-600">File selected</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-sm font-medium text-slate-600">Click to upload PDF</div>
                  <div className="text-xs text-slate-400">PDF only, max 10 MB</div>
                </div>
              )}
              <input type="file" accept=".pdf" className="hidden" onChange={handleFile} />
            </label>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-600 mb-2">Supporting Documents Checklist</div>
            <div className="space-y-2">
              {[
                'Institutional support letter',
                'Applicant CV',
                'Budget breakdown',
                'Ethics approval (if applicable)',
              ].map(doc => (
                <div key={doc} className="flex items-center gap-2 text-sm text-slate-600">
                  <input type="checkbox" id={doc} className="rounded accent-blue-600" />
                  <label htmlFor={doc}>{doc}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <PlusCircle size={16} />
          {submitting ? 'Submitting…' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}
