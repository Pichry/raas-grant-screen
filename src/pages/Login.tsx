import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await login(email, password);
    setLoading(false);
    if (err) { setError(err); return; }
    navigate('/');
  };

  const fillDemo = (role: 'admin' | 'officer' | 'applicant') => {
    if (role === 'admin') { setEmail('admin@raas.rw'); setPassword('Admin2025!'); }
    else if (role === 'officer') { setEmail('officer@raas.rw'); setPassword('Officer2025!'); }
    else { setEmail('applicant@raas.rw'); setPassword('Applicant2025!'); }
    setError('');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-[55%] bg-[#0f2248] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-blue-600 blur-3xl" />
        </div>

        {/* Grid decoration */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-xl" style={{ fontFamily: 'var(--font-display)' }}>RAAS GrantScreen AI</div>
              <div className="text-blue-300 text-sm">Research Analytics & AI Solutions Ltd</div>
            </div>
          </div>

          <h1 className="text-5xl font-extrabold text-white leading-tight mb-6" style={{ fontFamily: 'var(--font-display)' }}>
            AI-Assisted Grant<br />
            <span className="text-blue-400">Proposal Screening</span>
          </h1>

          <p className="text-blue-200 text-lg leading-relaxed mb-10 max-w-md">
            A localized intelligent screening platform for Rwanda's National Innovation Fund — supporting grant officers with preliminary proposal analysis.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-sm">
            {[
              { label: 'Proposals Analysed', value: '15+', sub: 'Demo dataset' },
              { label: 'AI Accuracy', value: '—', sub: 'Human decides' },
              { label: 'Grant Calls', value: '4', sub: 'NRIF 2025' },
              { label: 'Languages', value: '2', sub: 'EN / Kinyarwanda' },
            ].map(s => (
              <div key={s.label} className="bg-white/8 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</div>
                <div className="text-blue-300 text-xs mt-1 font-medium">{s.label}</div>
                <div className="text-blue-400/60 text-[11px]">{s.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-lg border border-blue-500/30 max-w-max">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-blue-200 text-xs">Demo Prototype — Fictional Sample Data Only</span>
          </div>
          <p className="text-blue-300/50 text-xs mt-3">
            Not officially affiliated with NRIF or RIGMS. For assessment purposes only.
          </p>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f0f4f8]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 bg-[#0f2248] rounded-xl flex items-center justify-center">
              <Shield size={17} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>RAAS GrantScreen AI</div>
              <div className="text-slate-500 text-xs">NRIF Screening System</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1" style={{ fontFamily: 'var(--font-display)' }}>Sign in</h2>
            <p className="text-slate-500 text-sm mb-8">Access the grant screening system</p>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-6">
                <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Demo credentials */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">Demo Credentials</p>
              <div className="space-y-2">
                <button
                  onClick={() => fillDemo('admin')}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Administrator</div>
                      <div className="text-[11px] text-slate-500 font-mono">admin@raas.rw / Admin2025!</div>
                    </div>
                    <span className="text-[10px] bg-navy-100 text-blue-700 px-2 py-0.5 rounded-full font-medium bg-blue-50">ADMIN</span>
                  </div>
                </button>
                <button
                  onClick={() => fillDemo('officer')}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Grant Officer</div>
                      <div className="text-[11px] text-slate-500 font-mono">officer@raas.rw / Officer2025!</div>
                    </div>
                    <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">OFFICER</span>
                  </div>
                </button>
                <button
                  onClick={() => fillDemo('applicant')}
                  className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Applicant</div>
                      <div className="text-[11px] text-slate-500 font-mono">applicant@raas.rw / Applicant2025!</div>
                    </div>
                    <span className="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">APPLICANT</span>
                  </div>
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              New applicant?{' '}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
