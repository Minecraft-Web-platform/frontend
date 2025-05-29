import { EnhancedWithAuthHttpService } from "../../../../shared/services/http-auth.service";
import { httpFactoryService } from "../../../../shared/services/http-factory.service";
import { CreateAccountRequest, CreateAccountResponse } from "./types/create-account.types";
import { GetAccountResponse, GetAllAccounsRequest, GetAllAccountsResponse } from "./types/get-account.types";

export class AccountService {
  constructor(private readonly httpEnchAuthService: EnhancedWithAuthHttpService) {
    this.httpEnchAuthService = httpEnchAuthService;
  }

  public async getById(accountID: string): Promise<GetAccountResponse> {
    return this.httpEnchAuthService.get<GetAccountResponse>(`/economy/account/${accountID}/`);
  }

  public async getAll(data: GetAllAccounsRequest): Promise<GetAllAccountsResponse> {
    return this.httpEnchAuthService.get<GetAllAccountsResponse>(`/economy/account?username=${data.username}/`);
  }

  public async create(data: CreateAccountRequest): Promise<CreateAccountResponse> {
    return this.httpEnchAuthService.post<CreateAccountResponse, CreateAccountRequest>('/economy/account/', data);
  }

  public async delete(accountID: string): Promise<void> {
    return this.httpEnchAuthService.delete<void>(`/economy/account/${accountID}/`);
  }
}

export const accountService = new AccountService(httpFactoryService.createAuthHttpService());