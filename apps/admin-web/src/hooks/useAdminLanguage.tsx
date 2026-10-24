"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type AdminLanguage = "en" | "hi";

interface AdminLanguageContextType {
  lang: AdminLanguage;
  setLang: (lang: AdminLanguage) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const adminTranslations: Record<AdminLanguage, Record<string, string>> = {
  en: {
    // Government header
    gov_title_en: "Government of Uttarakhand • भारत सरकार",
    gov_title_hi: "Dehradun Municipal Corporation • नगर निगम देहरादून",
    gov_sub_dept: "Zonal Municipal Administration & Magistrate Control Portal",
    session_active: "Official Zonal Session: Active",
    rbac_protected: "RBAC Protected",
    lang_btn_label: "English | हिन्दी",

    // Sidebar
    brand_sub: "Magistrate Console",
    zonal_operations: "Zonal Operations",
    nav_dashboard: "Dashboard & Load Balance",
    nav_my_sector: "My Sector Issues",
    nav_all_issues: "All Municipal Issues",
    nav_transparency: "Public Transparency Feed",
    exit_session: "Exit Magistrate Session",
    rank_super_admin: "Super Admin",
    rank_magistrate: "Zonal Magistrate",
    all_sectors_hq: "All Sectors (HQ)",

    // Dashboard & Filters
    sector_ops_center: "Sector Operations & Load Balancing Center",
    workload_summary: "Real-time Municipal Sector Load Balance & Incident Queue",
    filter_all: "All Sectors",
    filter_my_sector: "My Sector Only",
    filter_status: "Status",
    filter_priority: "Priority",
    search_issues_placeholder: "Search issues by title, locality or ID...",

    // Action Console & Issue Detail
    action_console: "Magistrate Action Console",
    jurisdiction_valid: "Official Jurisdiction Validated",
    jurisdiction_desc: "You are authorized as the Zonal Magistrate to inspect, remediate, upgrade status, and broadcast resolution proof.",
    jurisdiction_lock: "Sector Jurisdiction Lock (View Only Mode)",
    jurisdiction_lock_desc: "Under Municipal Sector Partitioning protocols, status upgrades and resolution broadcasts are restricted exclusively to the designated Zonal Magistrate.",
    resolve_and_broadcast: "Resolve & Broadcast to Transparency",
    under_review: "Under Review",
    in_progress: "In Progress",
    reject_issue: "Reject (Duplicate / Out of Scope)",
    back_to_dashboard: "Back to Sector Operations Dashboard",

    // Evidence & Geotag
    evidence_record: "Photographic Evidence Record",
    before_citizen: "BEFORE — Citizen Reported Evidence",
    after_magistrate: "AFTER — Geotagged Magistrate Resolution Proof",
    no_initial_photo: "No initial photo attached by citizen",
    action_taken_label: "Action Taken",
    audit_trail: "Official Audit Trail",

    // Modal
    modal_title: "Resolve Issue & Publish Geotagged Proof",
    gps_locked: "📍 GPS Location Locked",
    gps_pending: "GPS Geotag Pending",
    lock_gps_btn: "Lock GPS",
    use_sector_gps_btn: "Use Sector GPS",
    live_camera_btn: "📍 Live Camera & Geotag",
    upload_geotag_btn: "Upload & Geotag",
    use_sample_btn: "Use Verified Site Photo",
    remediation_report_label: "Official Magistrate Remediation Report & Inspection Remarks",
    broadcast_callout_title: "Broadcast to Government Transparency Dashboard",
    broadcast_checkbox: "Publish geotagged resolution post to public transparency dashboard",
    btn_cancel: "Cancel",
    btn_confirm_broadcast: "Confirm & Broadcast Resolution",
    btn_broadcasting: "Recording & Broadcasting...",

    // Transparency Feed
    transparency_title: "Government Transparency Dashboard",
    transparency_subtitle: "Public accountability audit trail: Official issue resolutions broadcasted by Zonal Magistrates",
    refresh_feed: "Refresh Feed",
    publicly_audited: "Publicly Audited",
    live_network_title: "Live Citizen Transparency & Magistrate Accountability Network",
    live_network_desc: "Every resolved issue posted here contains ground photographic evidence and official inspection notes logged by the territorial magistrate.",
    no_broadcasts_title: "No Resolution Broadcasts Recorded Yet",
    official_proof_badge: "OFFICIAL RESOLUTION PROOF",
    audit_valid: "Audit Valid",
    verified_authority: "Verified Zonal Authority • DMC",
  },
  hi: {
    // Government header
    gov_title_en: "उत्तराखंड सरकार • Government of Uttarakhand",
    gov_title_hi: "नगर निगम देहरादून • Dehradun Municipal Corporation",
    gov_sub_dept: "जोनल नगर प्रशासन एवं मजिस्ट्रेट नियंत्रण पोर्टल",
    session_active: "आधिकारिक जोनल सत्र: सक्रिय",
    rbac_protected: "आरबीएसी संरक्षित",
    lang_btn_label: "हिन्दी | English",

    // Sidebar
    brand_sub: "मजिस्ट्रेट कंसोल",
    zonal_operations: "जोनल संचालन",
    nav_dashboard: "डैशबोर्ड एवं कार्यभार संतुलन",
    nav_my_sector: "मेरे सेक्टर की समस्याएं",
    nav_all_issues: "सभी नगर निगम समस्याएं",
    nav_transparency: "सार्वजनिक पारदर्शिता फ़ीड",
    exit_session: "मजिस्ट्रेट सत्र समाप्त करें",
    rank_super_admin: "मुख्य प्रशासक (Super Admin)",
    rank_magistrate: "जोनल मजिस्ट्रेट",
    all_sectors_hq: "समस्त सेक्टर (मुख्यालय)",

    // Dashboard & Filters
    sector_ops_center: "जोनल संचालन एवं कार्यभार नियंत्रण केंद्र",
    workload_summary: "वास्तविक समय नगर निगम सेक्टर भार एवं शिकायत निवारण स्थिति",
    filter_all: "सभी सेक्टर",
    filter_my_sector: "केवल मेरा सेक्टर",
    filter_status: "स्थिति",
    filter_priority: "प्राथमिकता",
    search_issues_placeholder: "शीर्षक, क्षेत्र या आईडी द्वारा खोजें...",

    // Action Console & Issue Detail
    action_console: "मजिस्ट्रेट कार्रवाई कंसोल",
    jurisdiction_valid: "आधिकारिक जोनल क्षेत्राधिकार मान्य",
    jurisdiction_desc: "आप जोनल मजिस्ट्रेट के रूप में निरीक्षण, स्थिति उन्नयन तथा समाधान प्रमाण प्रसारित करने हेतु अधिकृत हैं।",
    jurisdiction_lock: "सेक्टर क्षेत्राधिकार लॉक (केवल पठन मोड)",
    jurisdiction_lock_desc: "नगर निगम क्षेत्रीय विभाजन नियमों के अंतर्गत, स्थिति उन्नयन केवल संबंधित जोनल मजिस्ट्रेट द्वारा ही किया जा सकता है।",
    resolve_and_broadcast: "समाधान करें एवं पारदर्शिता पोर्टल पर प्रसारित करें",
    under_review: "समीक्षाधीन",
    in_progress: "प्रगति पर है",
    reject_issue: "निरस्त करें (असंगत / दोहराव)",
    back_to_dashboard: "सेक्टर संचालन डैशबोर्ड पर वापस जाएं",

    // Evidence & Geotag
    evidence_record: "फोटोग्राफिक साक्ष्य अभिलेख",
    before_citizen: "पूर्व स्थिति — नागरिक द्वारा प्रस्तुत साक्ष्य",
    after_magistrate: "समाधान पश्चात — जियोटैग मजिस्ट्रेट समाधान प्रमाण",
    no_initial_photo: "नागरिक द्वारा कोई प्रारंभिक फोटो संलग्न नहीं की गई",
    action_taken_label: "की गई कार्रवाई",
    audit_trail: "आधिकारिक ऑडिट ट्रेल",

    // Modal
    modal_title: "समस्या समाधान एवं जियोटैग प्रमाण प्रकाशन",
    gps_locked: "📍 जीपीएस निर्देशांक सुरक्षित",
    gps_pending: "जीपीएस जियोटैग प्रतीक्षारत",
    lock_gps_btn: "जीपीएस लॉक करें",
    use_sector_gps_btn: "सेक्टर जीपीएस का उपयोग करें",
    live_camera_btn: "📍 लाइव कैमरा एवं जियोटैग",
    upload_geotag_btn: "अपलोड एवं जियोटैग करें",
    use_sample_btn: "सत्यापित स्थल फोटो का उपयोग करें",
    remediation_report_label: "आधिकारिक मजिस्ट्रेट निवारण रिपोर्ट एवं निरीक्षण टिप्पणी",
    broadcast_callout_title: "सरकारी पारदर्शिता डैशबोर्ड पर प्रसारण",
    broadcast_checkbox: "सार्वजनिक नागरिक समीक्षा हेतु इस समाधान को पारदर्शिता फ़ीड पर पोस्ट करें",
    btn_cancel: "रद्द करें",
    btn_confirm_broadcast: "समाधान की पुष्टि करें एवं प्रसारित करें",
    btn_broadcasting: "दर्ज एवं प्रसारित किया जा रहा है...",

    // Transparency Feed
    transparency_title: "सरकारी पारदर्शिता डैशबोर्ड",
    transparency_subtitle: "सार्वजनिक जवाबदेही ऑडिट ट्रेल: जोनल मजिस्ट्रेटों द्वारा प्रसारित आधिकारिक समस्या समाधान",
    refresh_feed: "फ़ीड ताज़ा करें",
    publicly_audited: "सार्वजनिक रूप से परीक्षित",
    live_network_title: "नागरिक पारदर्शिता एवं मजिस्ट्रेट जवाबदेही नेटवर्क",
    live_network_desc: "यहाँ प्रकाशित प्रत्येक समाधान में भू-सत्यापित फोटो साक्ष्य तथा मजिस्ट्रेट निरीक्षण टिप्पणी सम्मिलित है।",
    no_broadcasts_title: "वर्तमान में कोई समाधान प्रसारण उपलब्ध नहीं है",
    official_proof_badge: "आधिकारिक समाधान प्रमाण",
    audit_valid: "वैध ऑडिट",
    verified_authority: "सत्यापित जोनल प्राधिकरण • नगर निगम देहरादून",
  },
};

const AdminLanguageContext = createContext<AdminLanguageContextType>({
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
  t: (key: string) => key,
});

const ADMIN_STORAGE_KEY = "civicpulse_admin_lang";

export function AdminLanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AdminLanguage>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADMIN_STORAGE_KEY) as AdminLanguage | null;
      if (saved === "en" || saved === "hi") {
        setLangState(saved);
        document.documentElement.lang = saved;
      }
    } catch {
      // localStorage fallback
    }
  }, []);

  const setLang = (newLang: AdminLanguage) => {
    setLangState(newLang);
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    } catch {
      // ignore
    }
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "hi" : "en");
  };

  const t = (key: string): string => {
    return adminTranslations[lang]?.[key] || adminTranslations.en[key] || key;
  };

  return (
    <AdminLanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  return useContext(AdminLanguageContext);
}

export function AdminLanguageSwitcher() {
  const { lang, toggleLang } = useAdminLanguage();

  return (
    <button
      type="button"
      id="admin-lang-switcher"
      onClick={toggleLang}
      className="admin-portal-badge"
      title={lang === "en" ? "हिन्दी में देखें (Switch to Hindi)" : "Switch to English"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        cursor: "pointer",
        background: lang === "hi" ? "#fef3c7" : "#ffffff",
        borderColor: lang === "hi" ? "#f59e0b" : "#cbd5e1",
        color: "#0f172a",
        fontWeight: 700,
        fontSize: "0.75rem",
        padding: "4px 10px",
        borderRadius: "14px",
        transition: "all 0.2s ease",
      }}
    >
      <span style={{ fontSize: "0.85rem" }}>🌐</span>
      <span style={{ color: lang === "en" ? "#2563eb" : "#64748b" }}>English</span>
      <span style={{ opacity: 0.35 }}>|</span>
      <span style={{ color: lang === "hi" ? "#d97706" : "#64748b" }}>हिन्दी</span>
    </button>
  );
}
