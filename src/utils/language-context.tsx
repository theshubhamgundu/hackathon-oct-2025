import { createContext, useContext, useState, ReactNode } from 'react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
];

// Translation dictionary
const translations: Record<string, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard',
    'civic-companion': 'Civic Life Companion',
    'document-wallet': 'e-Document Wallet',
    'scheme-finder': 'Scheme Finder',
    'complaint-support': 'Complaint Support',
    profile: 'Profile',
    logout: 'Logout',
    welcome: 'Welcome',
    'your-civic-dashboard': 'Your Civic Dashboard',
    'access-government-services': 'Access government services, manage documents, and stay informed about welfare schemes.',
    'ask-questions': 'Ask questions about government services and procedures',
    'manage-documents': 'Manage your official documents securely',
    'discover-schemes': 'Discover welfare schemes you are eligible for',
    'file-complaints': 'File and track civic issues in your area',
    loading: 'Loading...',
    'sign-in': 'Sign In',
    'sign-up': 'Sign Up',
    email: 'Email',
    password: 'Password',
    name: 'Name',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    back: 'Back',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    'civic-companion': 'नागरिक जीवन साथी',
    'document-wallet': 'ई-दस्तावेज़ वॉलेट',
    'scheme-finder': 'योजना खोजक',
    'complaint-support': 'शिकायत सहायता',
    profile: 'प्रोफ़ाइल',
    logout: 'लॉग आउट',
    welcome: 'स्वागत है',
    'your-civic-dashboard': 'आपका नागरिक डैशबोर्ड',
    'access-government-services': 'सरकारी सेवाओं तक पहुंचें, दस्तावेज़ प्रबंधित करें, और कल्याण योजनाओं के बारे में जानकारी रखें।',
    'ask-questions': 'सरकारी सेवाओं और प्रक्रियाओं के बारे में प्रश्न पूछें',
    'manage-documents': 'अपने आधिकारिक दस्तावेज़ सुरक्षित रूप से प्रबंधित करें',
    'discover-schemes': 'उन कल्याण योजनाओं की खोज करें जिनके लिए आप पात्र हैं',
    'file-complaints': 'अपने क्षेत्र में नागरिक मुद्दों को दर्ज करें और ट्रैक करें',
    loading: 'लोड हो रहा है...',
    'sign-in': 'साइन इन करें',
    'sign-up': 'साइन अप करें',
    email: 'ईमेल',
    password: 'पासवर्ड',
    name: 'नाम',
    submit: 'जमा करें',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    delete: 'हटाएं',
    back: 'वापस',
  },
  ta: {
    dashboard: 'டாஷ்போர்டு',
    'civic-companion': 'குடிமை வாழ்க்கை துணை',
    'document-wallet': 'மின் ஆவண பணப்பை',
    'scheme-finder': 'திட்ட கண்டுபிடிப்பாளர்',
    'complaint-support': 'புகார் ஆதரவு',
    profile: 'சுயவிவரம்',
    logout: 'வெளியேறு',
    welcome: 'வரவேற்கிறோம்',
    loading: 'ஏற்றுகிறது...',
    back: 'பின்செல்',
  },
  te: {
    dashboard: 'డాష్‌బోర్డ్',
    'civic-companion': 'పౌర జీవిత సహచరుడు',
    'document-wallet': 'ఇ-డాక్యుమెంట్ వాలెట్',
    'scheme-finder': 'స్కీమ్ ఫైండర్',
    'complaint-support': 'ఫిర్యాదు మద్దతు',
    profile: 'ప్రొఫైల్',
    logout: 'లాగ్ అవుట్',
    welcome: 'స్వాగతం',
    loading: 'లోడ్ అవుతోంది...',
    back: 'వెనక్కి',
  },
  bn: {
    dashboard: 'ড্যাশবোর্ড',
    'civic-companion': 'নাগরিক জীবন সহচর',
    'document-wallet': 'ই-ডকুমেন্ট ওয়ালেট',
    'scheme-finder': 'স্কিম ফাইন্ডার',
    'complaint-support': 'অভিযোগ সহায়তা',
    profile: 'প্রোফাইল',
    logout: 'লগ আউট',
    welcome: 'স্বাগতম',
    loading: 'লোড হচ্ছে...',
    back: 'ফিরে যান',
  },
  mr: {
    dashboard: 'डॅशबोर्ड',
    'civic-companion': 'नागरी जीवन साथी',
    'document-wallet': 'ई-दस्तऐवज वॉलेट',
    'scheme-finder': 'योजना शोधक',
    'complaint-support': 'तक्रार समर्थन',
    profile: 'प्रोफाइल',
    logout: 'लॉग आउट',
    welcome: 'स्वागत',
    loading: 'लोड होत आहे...',
    back: 'मागे',
  },
};

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(SUPPORTED_LANGUAGES[0]);

  const t = (key: string): string => {
    const translation = translations[currentLanguage.code]?.[key];
    return translation || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage: setCurrentLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
