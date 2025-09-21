import { EnhancedWithAuthHttpService } from "../../../shared/services/http-auth.service";
import { httpFactoryService } from "../../../shared/services/http-factory.service";
import { GetInfoAboutMeRespone } from "../types/get-info-about-me.response";

class ProfileService {
  constructor(private readonly httpService: EnhancedWithAuthHttpService) {}

  public async getInfoAboutMe(): Promise<GetInfoAboutMeRespone> {
    return this.httpService.get<GetInfoAboutMeRespone>("auth/me/");
  }
}

export const profileService = new ProfileService(
  httpFactoryService.createAuthHttpService()
);
