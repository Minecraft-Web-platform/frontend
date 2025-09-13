import { EnhancedWithAuthHttpService } from "../../../../shared/services/http-auth.service";
import { httpFactoryService } from "../../../../shared/services/http-factory.service";

class TransferService {
  constructor(
    // @ts-expect-error: property not used yet
    private readonly httpEnchAuthService: EnhancedWithAuthHttpService
  ) {
    this.httpEnchAuthService = httpEnchAuthService;
  }
}

export const transferService = new TransferService(
  httpFactoryService.createAuthHttpService()
);
