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
import enProfile from './locales/en/profile.json';
import enEconomy from './locales/en/economy.json';
import enMap from './locales/en/map.json';
import enStates from './locales/en/states.json';
import enNews from './locales/en/news.json';
import enAdmin from './locales/en/admin.json';
import enPlayers from './locales/en/players.json';

// PL
import plAuth from './locales/pl/auth.json';
import plDownloadPage from './locales/pl/download-page.json';
import plErrors from './locales/pl/errors.json';
import plLandingPage from './locales/pl/landing-page.json';
import plNavigation from './locales/pl/navigation.json';
import plPlayerProfile from './locales/pl/player-profile.json';
import plPlayersList from './locales/pl/players-list.json';
import plTechSupport from './locales/pl/tech-support-page.json';
import plProfile from './locales/pl/profile.json';
import plEconomy from './locales/pl/economy.json';
import plMap from './locales/pl/map.json';
import plStates from './locales/pl/states.json';
import plNews from './locales/pl/news.json';
import plAdmin from './locales/pl/admin.json';
import plPlayers from './locales/pl/players.json';

// UA
import uaAuth from './locales/ua/auth.json';
import uaDownloadPage from './locales/ua/download-page.json';
import uaErrors from './locales/ua/errors.json';
import uaLandingPage from './locales/ua/landing-page.json';
import uaNavigation from './locales/ua/navigation.json';
import uaPlayerProfile from './locales/ua/player-profile.json';
import uaPlayersList from './locales/ua/players-list.json';
import uaTechSupport from './locales/ua/tech-support-page.json';
import uaProfile from './locales/ua/profile.json';
import uaEconomy from './locales/ua/economy.json';
import uaMap from './locales/ua/map.json';
import uaStates from './locales/ua/states.json';
import uaNews from './locales/ua/news.json';
import uaAdmin from './locales/ua/admin.json';
import uaPlayers from './locales/ua/players.json';

// RU
import ruAuth from './locales/ru/auth.json';
import ruDownloadPage from './locales/ru/download-page.json';
import ruErrors from './locales/ru/errors.json';
import ruLandingPage from './locales/ru/landing-page.json';
import ruNavigation from './locales/ru/navigation.json';
import ruPlayerProfile from './locales/ru/player-profile.json';
import ruPlayersList from './locales/ru/players-list.json';
import ruTechSupport from './locales/ru/tech-support-page.json';
import ruProfile from './locales/ru/profile.json';
import ruEconomy from './locales/ru/economy.json';
import ruMap from './locales/ru/map.json';
import ruStates from './locales/ru/states.json';
import ruNews from './locales/ru/news.json';
import ruAdmin from './locales/ru/admin.json';
import ruPlayers from './locales/ru/players.json';

export const defaultNS = 'navigation';

const uaResources = {
  auth: uaAuth,
  'download-page': uaDownloadPage,
  errors: uaErrors,
  'landing-page': uaLandingPage,
  navigation: uaNavigation,
  'player-profile': uaPlayerProfile,
  'players-list': uaPlayersList,
  'tech-support-page': uaTechSupport,
  profile: uaProfile,
  economy: uaEconomy,
  map: uaMap,
  states: uaStates,
  news: uaNews,
  admin: uaAdmin,
  players: uaPlayers
};

export const resources = {
  en: {
    auth: enAuth,
    'download-page': enDownloadPage,
    errors: enErrors,
    'landing-page': enLandingPage,
    navigation: enNavigation,
    'player-profile': enPlayerProfile,
    'players-list': enPlayersList,
    'tech-support-page': enTechSupport,
    profile: enProfile,
    economy: enEconomy,
    map: enMap,
    states: enStates,
    news: enNews,
    admin: enAdmin,
    players: enPlayers
  },
  pl: {
    auth: plAuth,
    'download-page': plDownloadPage,
    errors: plErrors,
    'landing-page': plLandingPage,
    navigation: plNavigation,
    'player-profile': plPlayerProfile,
    'players-list': plPlayersList,
    'tech-support-page': plTechSupport,
    profile: plProfile,
    economy: plEconomy,
    map: plMap,
    states: plStates,
    news: plNews,
    admin: plAdmin,
    players: plPlayers
  },
  ua: uaResources,
  uk: uaResources,
  ru: {
    auth: ruAuth,
    'download-page': ruDownloadPage,
    errors: ruErrors,
    'landing-page': ruLandingPage,
    navigation: ruNavigation,
    'player-profile': ruPlayerProfile,
    'players-list': ruPlayersList,
    'tech-support-page': ruTechSupport,
    profile: ruProfile,
    economy: ruEconomy,
    map: ruMap,
    states: ruStates,
    news: ruNews,
    admin: ruAdmin,
    players: ruPlayers
  }
} as const;

console.log('i18n initialized');

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru',
    defaultNS,
    ns: Object.keys(resources.en),
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;