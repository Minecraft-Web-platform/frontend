import { EnhancedWithAuthHttpService } from "../../../shared/services/http-auth.service";
import { httpFactoryService } from "../../../shared/services/http-factory.service";

class TechSupportService {
  constructor(private readonly httpService: EnhancedWithAuthHttpService) {}

  public async send(data: FormData) {
    return this.httpService.post<void, FormData>("tickets", data);
  }
}

export const techSupportService = new TechSupportService(
  httpFactoryService.createAuthHttpService()
);
