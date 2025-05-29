import { EnhancedWithAuthHttpService } from './http-auth.service';
import { HttpService } from './http.service';
import { mainAxios } from './main-axios';

export class HttpFactoryService {
  public createHttpService(): HttpService {
    return new HttpService(mainAxios);
  }

  public createAuthHttpService(): EnhancedWithAuthHttpService {
    return new EnhancedWithAuthHttpService(this.createHttpService());
  }
}

export const httpFactoryService = new HttpFactoryService();
