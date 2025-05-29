import { EnhancedWithAuthHttpService } from "../../../../shared/services/http-auth.service";
import { httpFactoryService } from "../../../../shared/services/http-factory.service";
import { accountService, AccountService } from "../account/account.service";
import { CreationRequest, CreationResponse } from './types/creation.types';
import { DeletionResponse } from "./types/deletion.types";

class CardService {
  constructor(
    private readonly httpEnchAuthService: EnhancedWithAuthHttpService,
    private readonly accountService: AccountService,
  ) {
    this.httpEnchAuthService = httpEnchAuthService;
    this.accountService = accountService;
  }

  public async create(data: CreationRequest): Promise<CreationResponse> {
    const accounts = await this.accountService.getAll({ username: data.username });

    if (accounts.length === 0) {
      throw new Error('User do not have any accounts!');
    }

    const account = accounts.find(acc => acc.currency === data.currency);

    if (!account) {
      throw new Error('User do not have an account with the same currency!');
    }

    return this.httpEnchAuthService.post<CreationResponse, CreationRequest>('/economy/card/', data);
  }

  public async delete(cardId: string): Promise<DeletionResponse> {
    return this.httpEnchAuthService.delete<DeletionResponse>(`/economy/card/${cardId}`);
  }
}

export const cardService = new CardService(httpFactoryService.createAuthHttpService(), accountService);
