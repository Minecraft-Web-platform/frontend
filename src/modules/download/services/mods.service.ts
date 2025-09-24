import { EnhancedWithAuthHttpService } from "../../../shared/services/http-auth.service";
import { httpFactoryService } from "../../../shared/services/http-factory.service";
import { ModType } from "../types/ mod.type";

class ModsService {
  private readonly SERVER_URL: string;

  constructor(private readonly httpService: EnhancedWithAuthHttpService) {
    this.httpService = httpService;
    this.SERVER_URL = import.meta.env.VITE_BACKEND_URL;
  }

  public async getAllOptionalMods(): Promise<ModType[]> {
    return this.httpService.get("mods");
  }

  public async getModpack(optional: string[]): Promise<Blob> {
    const res = await fetch(this.SERVER_URL + "/mods/modpack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optional }),
    });

    if (!res.ok) {
      throw new Error("Error during downloading modpack");
    }

    return await res.blob();
  }
}

export const modsService = new ModsService(
  httpFactoryService.createAuthHttpService()
);
