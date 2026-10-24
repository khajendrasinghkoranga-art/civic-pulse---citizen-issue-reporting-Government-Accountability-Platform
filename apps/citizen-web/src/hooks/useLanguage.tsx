'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    nav_dashboard: 'Dashboard',
    nav_report: 'Report Issue',
    nav_issues: 'My Issues',
    nav_community: 'Community',
    nav_transparency: 'Transparency',
    nav_notifications: 'Notifications',
    nav_profile: 'Profile',
    nav_logout: 'Logout',
    nav_language: 'Language',

    // Branding & Header
    gov_badge: 'Citizen Issue Reporting & Government Accountability',
    lang_switch_label: 'English',
    lang_other_label: 'हिन्दी',

    // Actions & Buttons
    btn_report_new: 'Report New Issue',
    btn_submit: 'Submit',
    btn_cancel: 'Cancel',
    btn_filter: 'Filter',
    btn_view_details: 'View Details',
    btn_sign_in: 'Sign In',
    btn_sign_up: 'Sign Up',

    // Statuses
    status_submitted: 'Submitted',
    status_under_review: 'Under Review',
    status_in_progress: 'In Progress',
    status_resolved: 'Resolved',
    status_rejected: 'Rejected',

    // Feed / Dashboard
    welcome_back: 'Welcome back',
    citizen_portal: 'CivicPulse Citizen Portal',
    issues_reported: 'Reported Issues',
    track_issues_desc: 'Track and verify municipal remediation in real time.',
  },
  hi: {
    // Nav
    nav_dashboard: 'डैशबोर्ड',
    nav_report: 'समस्या दर्ज करें',
    nav_issues: 'मेरी शिकायतें',
    nav_community: 'नागरिक मंच',
    nav_transparency: 'पारदर्शिता',
    nav_notifications: 'सूचनाएं',
    nav_profile: 'प्रोफ़ाइल',
    nav_logout: 'लॉगआउट',
    nav_language: 'भाषा',

    // Branding & Header
    gov_badge: 'नागरिक समस्या समाधान एवं सरकारी जवाबदेही मंच',
    lang_switch_label: 'हिन्दी',
    lang_other_label: 'English',

    // Actions & Buttons
    btn_report_new: 'नई समस्या दर्ज करें',
    btn_submit: 'जमा करें',
    btn_cancel: 'रद्द करें',
    btn_filter: 'फ़िल्टर करें',
    btn_view_details: 'विवरण देखें',
    btn_sign_in: 'लॉगिन करें',
    btn_sign_up: 'पंजीकरण करें',

    // Statuses
    status_submitted: 'दर्ज की गई',
    status_under_review: 'समीक्षाधीन',
    status_in_progress: 'प्रगति पर है',
    status_resolved: 'समाधान हुआ',
    status_rejected: 'निरस्त',

    // Feed / Dashboard
    welcome_back: 'स्वागत है',
    citizen_portal: 'सिविकपल्स नागरिक पोर्टल',
    issues_reported: 'दर्ज की गई समस्याएं',
    track_issues_desc: 'नगर निगम द्वारा समाधान को वास्तविक समय में ट्रैक और सत्यापित करें।',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  t: (key: string) => key,
});

const STORAGE_KEY = 'civicpulse_citizen_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved === 'en' || saved === 'hi') {
        setLangState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // localStorage fallback
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // ignore
    }
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageSwitcherButton({ className = '' }: { className?: string }) {
  const { lang, toggleLang } = useLanguage();

  return (
    <button
      type="button"
      id="citizen-lang-switcher"
      onClick={toggleLang}
      className={`lang-switch-btn ${className}`}
      title={lang === 'en' ? 'हिन्दी में बदलें (Switch to Hindi)' : 'Switch to English'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(8px)',
        color: 'inherit',
        fontSize: '0.785rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <span style={{ fontSize: '0.9rem' }}>🌐</span>
      <span style={{ color: lang === 'en' ? '#f97316' : '#94a3b8' }}>EN</span>
      <span style={{ opacity: 0.4 }}>|</span>
      <span style={{ color: lang === 'hi' ? '#f97316' : '#94a3b8' }}>हिन्दी</span>
    </button>
  );
}
