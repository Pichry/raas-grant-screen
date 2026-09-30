import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'en' | 'rw';

const translations: Record<string, Record<Lang, string>> = {
  dashboard: { en: 'Dashboard', rw: 'Ikibaho' },
  applications: { en: 'Applications', rw: 'Ibirushanwa' },
  submit_application: { en: 'Submit Application', rw: 'Ohereza Ikirushanwa' },
  historical_proposals: { en: 'Historical Proposals', rw: 'Amasezerano ya Kera' },
  screening: { en: 'Screening', rw: 'Isuzuma' },
  reports: { en: 'Reports', rw: 'Raporo' },
  settings: { en: 'Settings', rw: 'Igenamiterere' },
  total_applications: { en: 'Total Applications', rw: 'Ibirushanwa byose' },
  eligible_applications: { en: 'Eligible Applications', rw: 'Ibirushanwa bikwiriye' },
  needs_review: { en: 'Needs Review', rw: 'Bisaba Isuzuma' },
  incomplete: { en: 'Incomplete', rw: 'Bitageze' },
  potential_duplicates: { en: 'Potential Duplicates', rw: 'Bishobora Kuba Ibyigisoreshwa' },
  textual_overlap: { en: 'Textual Overlap Cases', rw: "Indangagaciro z'Ijambo" },
  grant_officer: { en: 'Grant Officer', rw: 'Umuyobozi w\'Inkunga' },
  administrator: { en: 'Administrator', rw: 'Umuyobozi' },
  logout: { en: 'Logout', rw: 'Sohoka' },
  search: { en: 'Search applications...', rw: 'Shakisha ibirushanwa...' },
  status: { en: 'Status', rw: 'Imiterere' },
  screening_status: { en: 'Screening Status', rw: 'Imiterere y\'Isuzuma' },
  applicant: { en: 'Applicant', rw: 'Usaba' },
  institution: { en: 'Institution', rw: 'Inzego' },
  grant_call: { en: 'Grant Call', rw: 'Itangazo ry\'Inkunga' },
  submission_date: { en: 'Submission Date', rw: 'Itariki yo Gutura' },
  similarity_score: { en: 'Similarity Score', rw: 'Ipimo ry\'Ukwifuza' },
  run_screening: { en: 'Run Screening', rw: 'Tangira Isuzuma' },
  eligibility: { en: 'Eligibility', rw: 'Ubukwiye' },
  completeness: { en: 'Completeness', rw: 'Ukukamilika' },
  ai_analysis: { en: 'AI Analysis', rw: 'Isesengura rya AI' },
  clear_application: { en: 'Clear Application', rw: 'Kwemeza Ikirushanwa' },
  flag_for_review: { en: 'Flag for Review', rw: 'Shyira Akaraveti' },
  mark_incomplete: { en: 'Mark Incomplete', rw: 'Markwa Bitarakamala' },
  rwanda_national_innovation_fund: { en: 'Rwanda National Innovation Fund', rw: 'Ikigega cy\'Ihanga cy\'Uburemere bwa Rwanda' },
};

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const t = (key: string) => translations[key]?.[lang] ?? key;
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
