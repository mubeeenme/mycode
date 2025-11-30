import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files directly for static export
import en from '../locales/en/common.json';
import es from '../locales/es/common.json';
import fr from '../locales/fr/common.json';
import de from '../locales/de/common.json';
import zh from '../locales/zh/common.json';
import ja from '../locales/ja/common.json';

const resources = {
  en: { common: en },
  es: { common: es },
  fr: { common: fr },
  de: { common: de },
  zh: { common: zh },
  ja: { common: ja },
};

// Initialize react-i18next
i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    resources,
    defaultNS: 'common',
    react: {
      useSuspense: false,
    },
  });

export default i18n;