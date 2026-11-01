"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi" | "bn";

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "bn", label: "Bangla", nativeLabel: "বাংলা" },
];

export const TRANSLATIONS = {
  en: {
    dashboard: "Dashboard",
    institutions: "Institutions",
    complaints: "Complaints",
    intelligence: "AI Intelligence",
    relatedCases: "Related Cases",
    allocations: "Allocations",
    coordination: "Coordination",
    workflows: "Workflows",
    reports: "Reports",
    auditLogs: "Audit Logs",
    userManagement: "User Management",
    systemSettings: "System Settings",
    more: "More",
    signOut: "Sign Out",
    searchPlatform: "Search platform...",
    notifications: "Notifications",
    bureaus: "Bureaus",
    platform: "Platform",
    personas: "Personas",
    impact: "Impact",
    security: "Security",
    track: "Track",
    trackCase: "Track Case",
    officialLogin: "Official Login",
    downloadApp: "Download App",
    openDashboard: "Open the Dashboard",
    trackComplaint: "Track a Complaint",
    heroHeading1: "Every complaint.",
    heroHeading2: "One institution.",
    heroHeading3: "One clock.",
    heroSubhead: "PRISM unifies complaints across AICTE's Regulation Bureau, Public Grievance Redressal Cell, Regional Offices and every other Bureau into one secure, AI-assisted platform.",
    active: "Active",
    demo: "Demo",
    correlated: "Correlated",
    casesTracked: "Cases Tracked",
    bureausConnected: "Bureaus Connected",
    overlapsFlagged: "Overlaps Flagged",
    scroll: "Scroll",
    installPrismApp: "Install PRISM App",
    pwaReady: "PWA Ready",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    institutions: "संस्थान",
    complaints: "शिकायतें",
    intelligence: "एआई इंटेलिजेंस",
    relatedCases: "संबंधित मामले",
    allocations: "आवंटन",
    coordination: "समन्वय",
    workflows: "कार्यप्रवाह",
    reports: "रिपोर्ट्स",
    auditLogs: "ऑडिट लॉग",
    userManagement: "उपयोगकर्ता प्रबंधन",
    systemSettings: "सिस्टम सेटिंग्स",
    more: "अधिक",
    signOut: "साइन आउट",
    searchPlatform: "प्लेटफ़ॉर्म खोजें...",
    notifications: "सूचनाएं",
    bureaus: "ब्यूरो",
    platform: "प्लेटफ़ॉर्म",
    personas: "भूमिकाएं",
    impact: "प्रभाव",
    security: "सुरक्षा",
    track: "ट्रैक करें",
    trackCase: "मामला ट्रैक करें",
    officialLogin: "आधिकारिक लॉगिन",
    downloadApp: "ऐप डाउनलोड करें",
    openDashboard: "डैशबोर्ड खोलें",
    trackComplaint: "शिकायत ट्रैक करें",
    heroHeading1: "हर शिकायत।",
    heroHeading2: "एक संस्थान।",
    heroHeading3: "एक घड़ी।",
    heroSubhead: "प्रिज्म (PRISM) एआईसीटीई के विनियम ब्यूरो, लोक शिकायत निवारण प्रकोष्ठ, क्षेत्रीय कार्यालयों और सभी ब्यूरो की शिकायतों को एक सुरक्षित, एआई-सहायता प्राप्त मंच पर एकीकृत करता है।",
    active: "सक्रिय",
    demo: "डेमो",
    correlated: "संबद्ध",
    casesTracked: "ट्रैक किए गए मामले",
    bureausConnected: "जुड़े हुए ब्यूरो",
    overlapsFlagged: "पहचाने गए ओवरलैप",
    scroll: "नीचे स्क्रॉल करें",
    installPrismApp: "प्रिज्म ऐप इंस्टॉल करें",
    pwaReady: "पीडब्ल्यूए तैयार",
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    institutions: "প্রতিষ্ঠান",
    complaints: "অভিযোগসমূহ",
    intelligence: "এআই ইন্টেলিজেন্স",
    relatedCases: "সম্পর্কিত মামলা",
    allocations: "বরাদ্দকরণ",
    coordination: "সমন্বয়",
    workflows: "ওয়ার্কফ্লো",
    reports: "প্রতিবেদন",
    auditLogs: "অডিট লগ",
    userManagement: "ব্যবহারকারী পরিচালনা",
    systemSettings: "সিস্টেম সেটিংস",
    more: "আরও",
    signOut: "সাইন আউট",
    searchPlatform: "প্ল্যাটফর্ম খুঁজুন...",
    notifications: "বিজ্ঞপ্তি",
    bureaus: "ব্যুরো",
    platform: "প্ল্যাটফর্ম",
    personas: "ভূমিকা",
    impact: "প্রভাব",
    security: "নিরাপত্তা",
    track: "ট্র্যাক",
    trackCase: "কেস ট্র্যাক করুন",
    officialLogin: "অফিসিয়াল লগইন",
    downloadApp: "অ্যাপ ডাউনলোড করুন",
    openDashboard: "ড্যাশবোর্ড খুলুন",
    trackComplaint: "অভিযোগ ট্র্যাক করুন",
    heroHeading1: "প্রতিটি অভিযোগ।",
    heroHeading2: "একটি প্রতিষ্ঠান।",
    heroHeading3: "একটি ঘড়ি।",
    heroSubhead: "প্রিজম (PRISM) এআইসিটিই-র রেগুলেশন ব্যুরো, পাবলিক গ্রিভেন্স রিড্রেসাল সেল, আঞ্চলিক কার্যালয় এবং অন্যান্য সমস্ত ব্যুরোর অভিযোগগুলিকে একটি নিরাপদ, এআই-সহায়তাপ্রাপ্ত প্ল্যাটফর্মে সমন্বিত করে।",
    active: "সক্রিয়",
    demo: "ডেমো",
    correlated: "সম্পর্কিত",
    casesTracked: "ট্র্যাক করা কেস",
    bureausConnected: "সংযুক্ত ব্যুরো",
    overlapsFlagged: "চিহ্নিত ওভারল্যাপ",
    scroll: "স্ক্রোল করুন",
    installPrismApp: "প্রিজম অ্যাপ ইনস্টল করুন",
    pwaReady: "পিডব্লিউএ প্রস্তুত",
  },
};

type TranslationKey = keyof typeof TRANSLATIONS.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  currentOption: LanguageOption;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key) => TRANSLATIONS.en[key] || key,
  currentOption: LANGUAGE_OPTIONS[0],
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("prism_language") as Language | null;
      if (saved && (saved === "en" || saved === "hi" || saved === "bn")) {
        setLanguageState(saved);
        document.documentElement.lang = saved;
      }
    } catch {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("prism_language", lang);
      document.documentElement.lang = lang;
    } catch {}
  };

  const t = (key: TranslationKey): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    return (langDict as any)[key] || TRANSLATIONS.en[key] || key;
  };

  const currentOption =
    LANGUAGE_OPTIONS.find((opt) => opt.code === language) || LANGUAGE_OPTIONS[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentOption }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
