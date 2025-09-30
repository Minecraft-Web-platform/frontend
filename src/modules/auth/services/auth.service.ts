import { httpFactoryService } from "../../../shared/services/http-factory.service";
import { HttpService } from "../../../shared/services/http.service";
import {
  InitEmailConfirmationRequest,
  InitEmailConfirmationResponse,
  ConfirmEmailRequest,
  ConfirmEmailResponse,
} from "../types/confirmartion-email.types";

import { ConfirmRequest, ConfirmResponse } from "../types/confirmation.types";
import { LoginRequest, LoginResponse } from "../types/login.types";
import { LogoutRequest, LogoutResponse } from "../types/logout.types";
import {
  RegistrateRequest,
  RegistrateResponse,
} from "../types/registrate.types";

class AuthService {
  constructor(private readonly httpService: HttpService) {
    this.httpService = httpService;
  }

  public async registrate(
    data: RegistrateRequest
  ): Promise<RegistrateResponse> {
    return this.httpService.post<RegistrateResponse, RegistrateRequest>(
      "auth/register/",
      data
    );
  }

  public async login(data: LoginRequest): Promise<LoginResponse> {
    return this.httpService.post<LoginResponse, LoginRequest>(
      "auth/login/",
      data
    );
  }

  public async initConfirmation(data: { email: string }): Promise<void> {
    return this.httpService.post<void, { email: string }>(
      "auth/init-confirmation/",
      data
    );
  }

  public async confirm(data: ConfirmRequest): Promise<ConfirmResponse> {
    return this.httpService.patch<ConfirmResponse, ConfirmRequest>(
      "auth/confirm/",
      data
    );
  }

  public async initEmailConfirmation(
    data: InitEmailConfirmationRequest,
    accessToken: string
  ): Promise<InitEmailConfirmationResponse> {
    return this.httpService.post<
      InitEmailConfirmationResponse,
      InitEmailConfirmationRequest
    >("auth/init-email-confirmation/", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  }

  public async confirmEmail(
    data: ConfirmEmailRequest,
    accessToken: string
  ): Promise<ConfirmEmailResponse> {
    return this.httpService.post<ConfirmEmailResponse, ConfirmEmailRequest>(
      "auth/confirm-email/",
      data,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
  }

  public async logout(data: LogoutRequest): Promise<LogoutResponse> {
    return this.httpService.patch<LogoutResponse, LogoutRequest>(
      "auth/logout/",
      data
    );
  }
}

export const authService = new AuthService(
  httpFactoryService.createHttpService()
);
