import { EnhancedWithAuthHttpService } from "../../../../shared/services/http-auth.service";

class TransferService {
  constructor(private readonly httpEnchAuthService: EnhancedWithAuthHttpService) {
    this.httpEnchAuthService = httpEnchAuthService;
  }

  public async transfer()
}
