import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation & Bottom Bar
  home: { en: 'Home', ta: 'முகப்பு' },
  products: { en: 'Products', ta: 'பொருட்கள்' },
  enquiries: { en: 'Enquiries', ta: 'விசாரணைகள்' },
  orders: { en: 'Orders', ta: 'ஆர்டர்கள்' },
  stories: { en: 'Stories', ta: 'நேரடி நிலை' },
  account: { en: 'Account', ta: 'கணக்கு' },
  login: { en: 'Login', ta: 'உள்நுழைவு' },
  admin: { en: 'Admin Portal', ta: 'நிர்வாக போர்டல்' },
  notifications: { en: 'Notifications', ta: 'அறிவிப்புகள்' },
  wishlist: { en: 'Wishlist', ta: 'விருப்பப் பட்டியல்' },
  refunds: { en: 'Refunds & Ledger', ta: 'ரீஃபண்ட் & கணக்கு' },

  // Branding & Banner
  welcome: { en: 'MANIKANDAN LATHE WORKS', ta: 'மாணிக்கண்டன் லேத் ஒர்க்ஸ்' },
  tagline: { en: 'STRENGTH IN STEEL. TRUST FOR LIFE.', ta: 'இரும்பில் வலிமை. வாழ்நாள் நம்பிக்கை.' },
  factory_location: { en: 'Kallimandhayam, Dindigul', ta: 'கள்ளிமந்தையம், திண்டுக்கல்' },

  // Search & Catalog
  search_placeholder: { en: 'Search Gates, Window Grill, Kalappai, Steel Doors...', ta: 'கேட், கிரில், கலப்பை, கதவுகள் தேடுக...' },
  filter: { en: 'Filter', ta: 'வடிகட்டு' },
  sort: { en: 'Sort', ta: 'வரிசைப்படுத்து' },
  category: { en: 'Category', ta: 'பிரிவு' },
  ready_stock: { en: 'Ready Stock', ta: 'தயார் நிலை' },
  made_to_order: { en: 'Made to Order', ta: 'ஆர்டரின் பேரில்' },

  // Categories
  all_categories: { en: 'All Products', ta: 'அனைத்து பொருட்கள்' },
  main_gates: { en: 'Main Gates', ta: 'பிரதான கேட்' },
  window_grill: { en: 'Windows Grill', ta: 'ஜன்னல் கிரில்' },
  kalappai: { en: 'Tractor Kalappai', ta: 'டிராக்டர் கலப்பை' },
  steel_furniture: { en: 'Steel Furniture', ta: 'ஸ்டீல் பர்னிச்சர்' },
  lathe_turning: { en: 'Lathe Turning', ta: 'லேத் திருப்புதல்' },
  steel_doors: { en: 'Steel Doors', ta: 'ஸ்டீல் கதவுகள்' },
  machine_works: { en: 'Machine Works', ta: 'மெஷின் ஒர்க்ஸ்' },

  // Buttons & Actions
  request_quote: { en: 'Request Custom Quote', ta: 'விலை மதிப்பீடு பெறுக' },
  quick_enquiry: { en: 'Quick Workshop Enquiry', ta: 'உடனடி லேத் கேள்வி' },
  place_order: { en: 'Place Lathe Order', ta: 'ஆர்டர் செய்க' },
  call_us: { en: 'Call Lathe Workshop', ta: 'பட்டறையை அழைக்க' },
  whatsapp_chat: { en: 'WhatsApp Chat', ta: 'வாட்ஸ்அப் தொடர்பு' },
  view_details: { en: 'View Details', ta: 'விவரங்களை பார்க்க' },
  cancel_order: { en: 'Cancel Order', ta: 'ஆர்டர் ரத்து செய்' },
  download_invoice: { en: 'Download Invoice', ta: 'இன்வாய்ஸ் பதிவிறக்கம்' },

  // Status Labels
  ENQUIRY_RECEIVED: { en: 'ENQUIRY RECEIVED', ta: 'கேள்வி பெறப்பட்டது' },
  UNDER_REVIEW: { en: 'UNDER REVIEW', ta: 'பரிசீலனையில்' },
  ORDER_ACCEPTED: { en: 'ORDER ACCEPTED', ta: 'ஆர்டர் ஏற்கப்பட்டது' },
  IN_PRODUCTION: { en: 'IN PRODUCTION', ta: 'உற்பத்தியில்' },
  READY: { en: 'READY FOR DELIVERY', ta: 'டெலிவரிக்கு தயார்' },
  COMPLETED: { en: 'COMPLETED', ta: 'நிறைவடைந்தது' },
  REJECTED: { en: 'REJECTED', ta: 'ரத்து செய்யப்பட்டது' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('ml_language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ml_language', lang);
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'ta' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string, defaultText?: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
