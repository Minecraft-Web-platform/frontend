import { EnhancedWithAuthHttpService } from "../../../shared/services/http-auth.service";
import { httpFactoryService } from "../../../shared/services/http-factory.service";
import { GetAllUsersResponse } from "../types/get-all-users.response";
import { GetOnlinePlayersResponse } from "../types/get-online-players.response";
import { PlayerType } from "../types/player.type";

class PlayersService {
  constructor(private readonly httpService: EnhancedWithAuthHttpService) {}

  public async getAll(): Promise<GetAllUsersResponse> {
    return this.httpService.get<GetAllUsersResponse>("users");
  }

  public async getByUsername(username: string): Promise<PlayerType> {
    return this.httpService.get<PlayerType>(`users/${username}`);
  }

  public async getOnlinePlayers(): Promise<GetOnlinePlayersResponse> {
    return this.httpService.get<GetOnlinePlayersResponse>("server/players");
  }
}

export const playersService = new PlayersService(
  httpFactoryService.createAuthHttpService()
);
