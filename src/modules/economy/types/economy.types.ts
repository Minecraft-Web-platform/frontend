export type AccountType = 'personal' | 'company' | 'treasury';

export interface IAccount {
  id: string;
  accountNumber: string;
  ownerUsername: string;
  type: AccountType;
  balance: number;
  currencyCode: string;
  createdAt: string;
  bankName?: string;
}

export interface ICard {
  id: string;
  cardNumber: string;
  cvv: string;
  expiresAt: string;
  accountId: string;
  isBlocked: boolean;
  createdAt: string;
  account?: IAccount;
  bankName?: string;
}

export interface ITransfer {
  id: string;
  fromAccountNumber: string;
  toAccountNumber: string;
  amount: number;
  currencyCode: string;
  taxAmount: number;
  description?: string;
  createdAt: string;
}

export interface ICurrency {
  id: string;
  stateId: string | null;
  code: string;
  name: string;
  minecraftItemId: string;
  kopeckItemId: string;
  minecraftEnchantment: string;
  totalIssued: number;
  reserves: number;
  exchangeRate: number;
  rateChange24h: number;
  createdAt: string;
}

export interface ICompany {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  ownerUsername: string;
  cityId: string | null;
  stateId: string | null;
  accountId: string | null;
  isPublic: boolean;
  totalShares: number;
  availableShares: number;
  sharePrice: number;
  priceChange24h: number;
  createdAt: string;
}

export interface ICompanyShare {
  id: string;
  companyId: string;
  ownerUsername: string;
  sharesCount: number;
  boughtAtPrice: number;
  createdAt: string;
}

export interface CreateAccountRequest {
  type?: AccountType;
  currencyCode?: string;
  ownerUsername?: string;
}

export interface IssueCardRequest {
  accountId: string;
}

export interface TransferMoneyRequest {
  fromNumber: string;
  toNumber: string;
  amount: number;
  description?: string;
}

export interface CreateCurrencyRequest {
  stateId?: string;
  code: string;
  name: string;
  minecraftItemId?: string;
  kopeckItemId?: string;
  minecraftEnchantment?: string;
}

export interface IssueCurrencyRequest {
  amount: number;
}

export interface CreateCompanyRequest {
  name: string;
  description?: string;
  logoUrl?: string;
  cityId?: string;
  stateId?: string;
}

export interface ConductIPORequest {
  totalShares?: number;
  initialPrice?: number;
}

export interface BuySellSharesRequest {
  count: number;
}

export interface PayDividendsRequest {
  totalAmount: number;
}
