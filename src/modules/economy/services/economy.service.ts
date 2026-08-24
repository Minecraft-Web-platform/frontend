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
  ICompanySharePriceHistory,
  ICurrency,
  IIpoRequest,
  IssueCardRequest,
  IssueCurrencyRequest,
  ITransfer,
  PayDividendsRequest,
  TransferMoneyRequest,
  IProperty,
  CreatePropertyRequest,
  BuyPropertyRequest,
  ICompanyService,
  ICompanyOrder,
  CreateCompanyServiceRequest,
  CreateCompanyOrderRequest,
  CompanyOrderStatus,
  IOrderIdentity,
  ICurrencyRateHistory,
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

  public async getCurrencyById(currencyId: string): Promise<ICurrency> {
    return this.httpService.get(`economy/currencies/${currencyId}`);
  }

  public async issueCurrency(
    currencyId: string,
    data: IssueCurrencyRequest,
  ): Promise<ICurrency> {
    return this.httpService.post(`economy/currencies/${currencyId}/issue`, data);
  }

  public async getCurrencyRateHistory(currencyId: string): Promise<ICurrencyRateHistory[]> {
    return this.httpService.get(`economy/currencies/${currencyId}/rate-history`);
  }

  // --- Компании и Юрисдикция ---
  public async getAllCompanies(filters?: {
    cityId?: string;
    stateId?: string;
    ownerUsername?: string;
  }): Promise<ICompany[]> {
    const params = new URLSearchParams();
    if (filters?.cityId) params.append('cityId', filters.cityId);
    if (filters?.stateId) params.append('stateId', filters.stateId);
    if (filters?.ownerUsername) params.append('ownerUsername', filters.ownerUsername);
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

  public async updateCompany(
    id: string,
    data: { name?: string; description?: string; logoUrl?: string },
  ): Promise<ICompany> {
    return this.httpService.patch(`economy/companies/${id}`, data);
  }

  public async archiveCompany(id: string): Promise<void> {
    return this.httpService.delete(`economy/companies/${id}`);
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

  public async getIpoRequests(stateId: string): Promise<IIpoRequest[]> {
    return this.httpService.get(`economy/stock-exchange/ipo-requests/state/${stateId}`);
  }

  public async reviewIpoRequest(requestId: string, action: 'approved' | 'rejected'): Promise<IIpoRequest> {
    return this.httpService.post(`economy/stock-exchange/ipo-requests/${requestId}/review`, { action });
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

  public async getCompanySharePriceHistory(
    companyId: string,
  ): Promise<ICompanySharePriceHistory[]> {
    return this.httpService.get(`economy/stock-exchange/${companyId}/history`);
  }

  public async changeCompanySharePrice(
    companyId: string,
    newPrice: number,
  ): Promise<ICompany> {
    return this.httpService.post(`economy/stock-exchange/${companyId}/price`, { newPrice });
  }

  // --- Недвижимость и Имущество ---
  public async getMarketProperties(stateId?: string): Promise<IProperty[]> {
    const query = stateId ? `?stateId=${stateId}` : '';
    return this.httpService.get(`economy/properties/market${query}`);
  }

  public async getMyProperties(): Promise<IProperty[]> {
    return this.httpService.get(`economy/properties/my`);
  }

  public async createProperty(data: CreatePropertyRequest): Promise<IProperty> {
    return this.httpService.post('economy/properties', data);
  }

  public async listPropertyForSale(propertyId: string, price: number): Promise<IProperty> {
    return this.httpService.post(`economy/properties/${propertyId}/sell`, { price });
  }

  public async cancelListing(propertyId: string): Promise<IProperty> {
    return this.httpService.post(`economy/properties/${propertyId}/cancel-sell`, {});
  }

  public async buyProperty(propertyId: string, data: BuyPropertyRequest): Promise<IProperty> {
    return this.httpService.post(`economy/properties/${propertyId}/buy`, data);
  }

  // --- Услуги Компании и Заказы ---
  public async getCompanyServices(companyId: string): Promise<ICompanyService[]> {
    return this.httpService.get(`company-services/company/${companyId}`);
  }

  public async createCompanyService(companyId: string, data: CreateCompanyServiceRequest): Promise<ICompanyService> {
    return this.httpService.post(`company-services/company/${companyId}`, data);
  }

  public async updateCompanyService(companyId: string, serviceId: string, data: CreateCompanyServiceRequest): Promise<ICompanyService> {
    return this.httpService.put(`company-services/company/${companyId}/service/${serviceId}`, data);
  }

  public async getCompanyOrders(companyId: string): Promise<ICompanyOrder[]> {
    return this.httpService.get(`company-services/company/${companyId}/orders`);
  }

  public async getClientOrders(): Promise<ICompanyOrder[]> {
    return this.httpService.get(`company-services/client/orders`);
  }

  public async createCompanyOrder(data: CreateCompanyOrderRequest): Promise<ICompanyOrder> {
    return this.httpService.post(`company-services/order`, data);
  }

  public async updateOrderStatus(orderId: string, status: CompanyOrderStatus, comment?: string): Promise<ICompanyOrder> {
    return this.httpService.put(`company-services/order/${orderId}/status`, { status, comment });
  }

  public async arbitrateOrder(orderId: string, data: { decision: 'REFUND' | 'REJECT'; comment: string; finePercent?: number }): Promise<ICompanyOrder> {
    return this.httpService.put(`company-services/order/${orderId}/arbitrate`, data);
  }

  public async escalateOrder(orderId: string, comment: string): Promise<ICompanyOrder> {
    return this.httpService.put(`company-services/order/${orderId}/escalate`, { comment });
  }

  public async getDisputedOrders(): Promise<ICompanyOrder[]> {
    return this.httpService.get(`company-services/orders/disputed`);
  }

  public async getMyIdentities(): Promise<IOrderIdentity[]> {
    return this.httpService.get(`company-services/identities`);
  }
}

export const economyService = new EconomyService(
  httpFactoryService.createAuthHttpService(),
);
