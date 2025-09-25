import { EnhancedWithAuthHttpService } from "../../../shared/services/http-auth.service";
import { httpFactoryService } from "../../../shared/services/http-factory.service";
import { Ticket } from "../types/ticket.type";

class TechSupportService {
  constructor(private readonly httpService: EnhancedWithAuthHttpService) {}

  public async send(data: Ticket) {
    return this.httpService.post<void, Ticket>("tickets", data);
  }
}

export const techSupportService = new TechSupportService(
  httpFactoryService.createAuthHttpService()
);
