import useSWR from 'swr';
import { economyService } from '../services/economy.service';
import { statesService } from '../../states';
import useAuthStore from '../../../store/auth.store';

// Helper for SWR caching keys
export const ECONOMY_KEYS = {
  publicCompanies: 'economy/publicCompanies',
  myPortfolio: 'economy/myPortfolio',
  states: 'states/all',
  myCompanies: (username: string) => `economy/companies?ownerUsername=${username}`,
  allCurrencies: 'economy/currencies',
  myAccounts: 'economy/accounts/my',
  myCards: 'economy/cards/my',
  myTransfers: 'economy/transfers/my',
  myProperties: 'economy/properties/my',
  allCompanies: 'economy/companies/all',
};

export const usePublicCompanies = () => {
  return useSWR(ECONOMY_KEYS.publicCompanies, () => economyService.getPublicCompanies());
};

export const useAllCompanies = () => {
  return useSWR(ECONOMY_KEYS.allCompanies, () => economyService.getAllCompanies());
};

export const useMyPortfolio = () => {
  return useSWR(ECONOMY_KEYS.myPortfolio, () => economyService.getMyPortfolio());
};

export const useStates = () => {
  return useSWR(ECONOMY_KEYS.states, () => statesService.getStates());
};

export const useMyCompanies = () => {
  const { accessToken } = useAuthStore();
  let currentUsername = '';
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      currentUsername = payload.username_lower || '';
    } catch (e: any) {}
  }
  return useSWR(
    currentUsername ? ECONOMY_KEYS.myCompanies(currentUsername) : null,
    () => economyService.getAllCompanies({ ownerUsername: currentUsername })
  );
};

export const useCurrencies = () => {
  return useSWR(ECONOMY_KEYS.allCurrencies, () => economyService.getAllCurrencies());
};

export const useMyAccounts = () => {
  return useSWR(ECONOMY_KEYS.myAccounts, () => economyService.getMyAccounts());
};

export const useMyCards = () => {
  return useSWR(ECONOMY_KEYS.myCards, () => economyService.getMyCards());
};

export const useMyTransfers = () => {
  return useSWR(ECONOMY_KEYS.myTransfers, () => economyService.getMyTransfers());
};

export const useMyProperties = () => {
  return useSWR(ECONOMY_KEYS.myProperties, () => economyService.getMyProperties());
};

export const useMarketProperties = () => {
  return useSWR('economy/properties/market', () => economyService.getMarketProperties());
};
