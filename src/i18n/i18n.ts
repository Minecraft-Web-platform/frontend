import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// EN
import enAuth from './locales/en/auth.json';
import enDownloadPage from './locales/en/download-page.json';
import enErrors from './locales/en/errors.json';
import enLandingPage from './locales/en/landing-page.json';
import enNavigation from './locales/en/navigation.json';
import enPlayerProfile from './locales/en/player-profile.json';
import enPlayersList from './locales/en/players-list.json';
import enTechSupport from './locales/en/tech-support-page.json';

// PL
import plAuth from './locales/pl/auth.json';
import plDownloadPage from './locales/pl/download-page.json';
import plErrors from './locales/pl/errors.json';
import plLandingPage from './locales/pl/landing-page.json';
import plNavigation from './locales/pl/navigation.json';
import plPlayerProfile from './locales/pl/player-profile.json';
import plPlayersList from './locales/pl/players-list.json';
import plTechSupport from './locales/pl/tech-support-page.json';

// UA
import uaAuth from './locales/ua/auth.json';
import uaDownloadPage from './locales/ua/download-page.json';
import uaErrors from './locales/ua/errors.json';
import uaLandingPage from './locales/ua/landing-page.json';
import uaNavigation from './locales/ua/navigation.json';
import uaPlayerProfile from './locales/ua/player-profile.json';
import uaPlayersList from './locales/ua/players-list.json';
import uaTechSupport from './locales/ua/tech-support-page.json';

// RU
import ruAuth from './locales/ru/auth.json';
import ruDownloadPage from './locales/ru/download-page.json';
import ruErrors from './locales/ru/errors.json';
import ruLandingPage from './locales/ru/landing-page.json';
import ruNavigation from './locales/ru/navigation.json';
import ruPlayerProfile from './locales/ru/player-profile.json';
import ruPlayersList from './locales/ru/players-list.json';
import ruTechSupport from './locales/ru/tech-support-page.json';

export const defaultNS = 'navigation';

export const resources = {
  en: {
    auth: enAuth,
    'download-page': enDownloadPage,
    errors: enErrors,
    'landing-page': enLandingPage,
    navigation: enNavigation,
    'player-profile': enPlayerProfile,
    'players-list': enPlayersList,
    'tech-support-page': enTechSupport
  },
  pl: {
    auth: plAuth,
    'download-page': plDownloadPage,
    errors: plErrors,
    'landing-page': plLandingPage,
    navigation: plNavigation,
    'player-profile': plPlayerProfile,
    'players-list': plPlayersList,
    'tech-support-page': plTechSupport
  },
  ua: {
    auth: uaAuth,
    'download-page': uaDownloadPage,
    errors: uaErrors,
    'landing-page': uaLandingPage,
    navigation: uaNavigation,
    'player-profile': uaPlayerProfile,
    'players-list': uaPlayersList,
    'tech-support-page': uaTechSupport
  },
  ru: {
    auth: ruAuth,
    'download-page': ruDownloadPage,
    errors: ruErrors,
    'landing-page': ruLandingPage,
    navigation: ruNavigation,
    'player-profile': ruPlayerProfile,
    'players-list': ruPlayersList,
    'tech-support-page': ruTechSupport
  }
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    fallbackLng: 'en',
    defaultNS,
    ns: Object.keys(resources.en),
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;