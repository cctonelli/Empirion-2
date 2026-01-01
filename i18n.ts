
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem('i18nextLng') || 'pt',
    fallbackLng: 'pt',
    supportedLngs: ['pt', 'en', 'es'],
    ns: ['common', 'landing', 'dashboard', 'branches', 'auth', 'businessPlan', 'decisionsForm'],
    defaultNS: 'common',
    backend: {
      // In this environment, we fallback to relative path. 
      // Ensure JSON files are placed in public/locales/
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false, // Set to false to avoid crash if files aren't ready
    }
  });

export default i18n;
