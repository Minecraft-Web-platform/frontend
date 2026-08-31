import { httpFactoryService } from './http-factory.service';

export interface ServerStatusResponse {
  running: boolean;
}

export class ServerService {
  public async getPing(): Promise<ServerStatusResponse> {
    const http = httpFactoryService.createHttpService();
    return http.get<ServerStatusResponse>('/server/ping');
  }
}

export const serverService = new ServerService();
