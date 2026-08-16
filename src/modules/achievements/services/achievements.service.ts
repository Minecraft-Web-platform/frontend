import { EnhancedWithAuthHttpService } from '../../../shared/services/http-auth.service';
import { httpFactoryService } from '../../../shared/services/http-factory.service';
import {
  IAchievement,
  IUserAchievement,
  ICreateAchievementRequest,
  IUpdateAchievementRequest,
  IGrantAchievementRequest,
} from '../types/achievements.types';

export class AchievementsService {
  constructor(private readonly httpService: EnhancedWithAuthHttpService) {}

  public async getAchievements(): Promise<IAchievement[]> {
    return this.httpService.get('achievements');
  }

  public async getUserAchievements(username: string): Promise<IUserAchievement[]> {
    return this.httpService.get(`achievements/user/${username}`);
  }

  public async createAchievement(data: ICreateAchievementRequest): Promise<IAchievement> {
    return this.httpService.post('achievements', data);
  }

  public async updateAchievement(id: string, data: IUpdateAchievementRequest): Promise<IAchievement> {
    return this.httpService.put(`achievements/${id}`, data);
  }

  public async deleteAchievement(id: string): Promise<void> {
    return this.httpService.delete(`achievements/${id}`);
  }

  public async grantAchievement(data: IGrantAchievementRequest): Promise<IUserAchievement> {
    return this.httpService.post('achievements/grant', data);
  }

  public async revokeAchievement(data: IGrantAchievementRequest): Promise<void> {
    return this.httpService.post('achievements/revoke', data);
  }
}

export const achievementsService = new AchievementsService(httpFactoryService.createAuthHttpService());
