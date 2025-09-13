import { httpFactoryService } from "../../../shared/services/http-factory.service";
import { HttpService } from "../../../shared/services/http.service";
import { IHttpConfig } from "../../../shared/services/types";

class ModsService {
  constructor(private readonly httpService: HttpService) {
    this.httpService = httpService;
  }

  public async getAllOptionalMods(): Promise<string[]> {
    return this.httpService.get("/mods");
  }

  public async getModpack(optionalMods: string[]): Promise<Blob> {
    const data = { optionalMods: optionalMods };
    const config: IHttpConfig = {
      responseType: "blob",
    };

    return this.httpService.post<Blob, { optionalMods: string[] }>(
      "/mods",
      data,
      config
    );
  }
}

export const modsService = new ModsService(
  httpFactoryService.createHttpService()
);
