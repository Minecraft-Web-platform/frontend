import i18n, { BackendModule } from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const defaultNS = 'navigation';

const locales = import.meta.glob('./locales/**/*.json');

const dynamicLoadBackend: BackendModule = {
  type: 'backend',
  init: () => {},
  read(language, namespace, callback) {
    let resolvedLang = language;
    if (language === 'uk') resolvedLang = 'ua';
    if (language === 'kk') resolvedLang = 'kz';
    
    const path = `./locales/${resolvedLang}/${namespace}.json`;
    const loader = locales[path];
    
    if (loader) {
      loader()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .then((module: any) => callback(null, module.default || module))
        .catch(err => callback(err, null));
    } else {
      callback(new Error(`Locale not found: ${path}`), null);
    }
  }
};

i18n
  .use(dynamicLoadBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'ru',
    defaultNS,
    ns: ['navigation', 'auth', 'download-page', 'errors', 'landing-page', 'player-profile', 'players-list', 'tech-support-page', 'profile', 'economy', 'map', 'states', 'news', 'admin', 'players'],
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;