import { httpFactoryService } from "../../../shared/services/http-factory.service";
import { HttpService } from "../../../shared/services/http.service";
import { ConfirmRequest, ConfirmResponse } from "../types/confirmation.types";
import { LoginRequest, LoginResponse } from "../types/login.types";
import { LogoutRequest, LogoutResponse } from "../types/logout.types";
import { RegistrateRequest, RegistrateResponse } from "../types/registrate.types";

class AuthService {
  constructor(private readonly httpService: HttpService) {
  this.httpService = httpService; 
  }

  public async registrate(data: RegistrateRequest): Promise<RegistrateResponse> {
    return this.httpService.post<RegistrateResponse, RegistrateRequest>('/auth/registrate/', data);
  }

  public async login(data: LoginRequest): Promise<LoginResponse> {
    return this.httpService.post<LoginResponse, LoginRequest>('/auth/login/', data);
  }

  public async confirm(data: ConfirmRequest): Promise<ConfirmResponse> {
    return this.httpService.patch<ConfirmResponse, ConfirmRequest>('/auth/confirm/', data);
  }

  public async logout(data: LogoutRequest): Promise<LogoutResponse> {
    return this.httpService.patch<LogoutResponse, LogoutRequest>('/auth/logout/', data);
  }
}

export const authService = new AuthService(httpFactoryService.createHttpService());
