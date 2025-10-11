import { EnhancedWithAuthHttpService } from "../../../shared/services/http-auth.service";
import { httpFactoryService } from "../../../shared/services/http-factory.service";
import { GetInfoAboutMeRespone } from "../types/get-info-about-me.response";

class ProfileService {
  constructor(private readonly httpService: EnhancedWithAuthHttpService) {}

  public async getInfoAboutMe(): Promise<GetInfoAboutMeRespone> {
    return this.httpService.get<GetInfoAboutMeRespone>("auth/me/");
  }

  public async uploadAvatar(
    file: File,
    accessToken: string
  ): Promise<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/users/avatar`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка загрузки аватара: ${errorText}`);
    }

    return response.json();
  }
}

export const profileService = new ProfileService(
  httpFactoryService.createAuthHttpService()
);
