import { EnhancedWithAuthHttpService } from "../../../shared/services/http-auth.service";
import { httpFactoryService } from "../../../shared/services/http-factory.service";
import { GetAllUsersResponse } from "../types/get-all-users.response";

class PlayersService {
  constructor(private readonly httpService: EnhancedWithAuthHttpService) {}

  public async getAll(): Promise<GetAllUsersResponse> {
    return this.httpService.get<GetAllUsersResponse>("users");
  }
}

export const playersService = new PlayersService(
  httpFactoryService.createAuthHttpService()
);
