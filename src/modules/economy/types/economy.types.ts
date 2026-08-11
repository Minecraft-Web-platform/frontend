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
  title?: string;
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
  backgroundImageUrl?: string;
  currencyItemId?: string;
  companyName?: string;
}

export interface ITransfer {
  id: string;
  fromAccountNumber: string;
  toAccountNumber: string;
  fromOwnerName?: string;
  toOwnerName?: string;
  fromCoatOfArms?: string | null;
  toCoatOfArms?: string | null;
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
  exchangeStateId: string | null;
  totalShares: number;
  availableShares: number;
  sharePrice: number;
  priceChange24h: number;
  createdAt: string;
}

export interface ICompanyShare {
  id: string;
  companyId: string;
  ownerType: 'player' | 'state' | 'company';
  ownerId: string;
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
  exchangeStateId: string;
}

export interface BuySellSharesRequest {
  count: number;
  buyerType?: 'player' | 'state' | 'company';
  buyerId?: string;
  sellerType?: 'player' | 'state' | 'company';
  sellerId?: string;
}

export interface PayDividendsRequest {
  totalAmount: number;
}

export interface ICompanySharePriceHistory {
  id: string;
  companyId: string;
  price: number;
  changedByUsername: string;
  createdAt: string;
}
