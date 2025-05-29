import { EnhancedWithAuthHttpService } from "../../../../shared/services/http-auth.service";
import { httpFactoryService } from "../../../../shared/services/http-factory.service";
import { CreationRequest, CreationResponse } from './types/creation.types';
import { DeletionResponse } from "./types/deletion.types";

class CardService {
  constructor(private readonly httpEnchAuthService: EnhancedWithAuthHttpService) {
    this.httpEnchAuthService = httpEnchAuthService;
  }

  public async create(data: CreationRequest): Promise<CreationResponse> {
    return this.httpEnchAuthService.post<CreationResponse, CreationRequest>('/economy/card/', data);
  }

  public async delete(cardId: string): Promise<DeletionResponse> {
    return this.httpEnchAuthService.delete<DeletionResponse>(`/economy/card/${cardId}`);
  }
}

export const cardService = new CardService(httpFactoryService.createAuthHttpService());
