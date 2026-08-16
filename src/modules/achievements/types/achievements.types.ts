export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface IAchievement {
  id: string;
  title: string;
  description: string;
  iconUrl?: string;
  rarity: AchievementRarity;
  triggerEvent?: string;
  createdAt: string;
}

export interface IUserAchievement {
  id: string;
  earnedAt: string;
  achievement: IAchievement;
}

export interface ICreateAchievementRequest {
  title: string;
  description: string;
  iconUrl?: string;
  rarity?: AchievementRarity;
  triggerEvent?: string;
}

export interface IUpdateAchievementRequest {
  title?: string;
  description?: string;
  iconUrl?: string;
  rarity?: AchievementRarity;
  triggerEvent?: string;
}

export interface IGrantAchievementRequest {
  username: string;
  achievementId: string;
}
