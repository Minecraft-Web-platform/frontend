import { EnhancedWithAuthHttpService } from '../../../shared/services/http-auth.service';
import { httpFactoryService } from '../../../shared/services/http-factory.service';
import {
  BuySellSharesRequest,
  ConductIPORequest,
  CreateAccountRequest,
  CreateCompanyRequest,
  CreateCurrencyRequest,
  IAccount,
  ICard,
  ICompany,
  ICompanyShare,
  ICurrency,
  IssueCardRequest,
  IssueCurrencyRequest,
  ITransfer,
  PayDividendsRequest,
  TransferMoneyRequest,
} from '../types/economy.types';

export class EconomyService {
  constructor(private httpService: EnhancedWithAuthHttpService) {}

  // --- Банки и Счета ---
  public async getMyAccounts(): Promise<{
    accounts: IAccount[];
    cards: ICard[];
  }> {
    return this.httpService.get('economy/accounts/my');
  }

  public async createAccount(
    data: CreateAccountRequest,
  ): Promise<IAccount> {
    return this.httpService.post('economy/accounts', data);
  }

  public async issueCard(data: IssueCardRequest): Promise<ICard> {
    return this.httpService.post('economy/cards', data);
  }

  public async getMyCards(): Promise<ICard[]> {
    return this.httpService.get('economy/cards/my');
  }

  public async toggleBlockCard(cardId: string): Promise<ICard> {
    return this.httpService.patch(`economy/cards/${cardId}/toggle-block`, {});
  }

  public async deleteCard(cardId: string): Promise<{ success: true }> {
    return this.httpService.delete(`economy/cards/${cardId}`);
  }

  public async transferMoney(
    data: TransferMoneyRequest,
  ): Promise<ITransfer> {
    return this.httpService.post('economy/transfers', data);
  }

  public async getMyTransfers(): Promise<ITransfer[]> {
    return this.httpService.get('economy/transfers/my');
  }

  // --- Национальные Валюты ---
  public async getAllCurrencies(): Promise<ICurrency[]> {
    return this.httpService.get('economy/currencies');
  }

  public async createCurrency(
    data: CreateCurrencyRequest,
  ): Promise<ICurrency> {
    return this.httpService.post('economy/currencies', data);
  }

  public async issueCurrency(
    currencyId: string,
    data: IssueCurrencyRequest,
  ): Promise<ICurrency> {
    return this.httpService.post(`economy/currencies/${currencyId}/issue`, data);
  }

  // --- Компании и Юрисдикция ---
  public async getAllCompanies(filters?: {
    cityId?: string;
    stateId?: string;
  }): Promise<ICompany[]> {
    const params = new URLSearchParams();
    if (filters?.cityId) params.append('cityId', filters.cityId);
    if (filters?.stateId) params.append('stateId', filters.stateId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return this.httpService.get(`economy/companies${query}`);
  }

  public async getCompanyById(id: string): Promise<ICompany> {
    return this.httpService.get(`economy/companies/${id}`);
  }

  public async createCompany(
    data: CreateCompanyRequest,
  ): Promise<ICompany> {
    return this.httpService.post('economy/companies', data);
  }

  // --- Фондовая Биржа ---
  public async getPublicCompanies(): Promise<ICompany[]> {
    return this.httpService.get('economy/stock-exchange/companies');
  }

  public async getMyPortfolio(): Promise<ICompanyShare[]> {
    return this.httpService.get('economy/stock-exchange/my-portfolio');
  }

  public async conductIPO(
    companyId: string,
    data: ConductIPORequest,
  ): Promise<ICompany> {
    return this.httpService.post(`economy/stock-exchange/${companyId}/ipo`, data);
  }

  public async buyShares(
    companyId: string,
    data: BuySellSharesRequest,
  ): Promise<{ company: ICompany; portfolio: ICompanyShare }> {
    return this.httpService.post(`economy/stock-exchange/${companyId}/buy`, data);
  }

  public async sellShares(
    companyId: string,
    data: BuySellSharesRequest,
  ): Promise<{ company: ICompany; portfolio: ICompanyShare }> {
    return this.httpService.post(`economy/stock-exchange/${companyId}/sell`, data);
  }

  public async payDividends(
    companyId: string,
    data: PayDividendsRequest,
  ): Promise<{ distributed: number; shareholdersCount: number }> {
    return this.httpService.post(
      `economy/stock-exchange/${companyId}/dividends`,
      data,
    );
  }
}

export const economyService = new EconomyService(
  httpFactoryService.createAuthHttpService(),
);
