import { EnhancedWithAuthHttpService } from "../../../shared/services/http-auth.service";
import { httpFactoryService } from "../../../shared/services/http-factory.service";
import useAuthStore from "../../../store/auth.store";

import { News } from "../types/news.type";
import { CreateNewsDto } from "../types/create-news.dto";
import { UpdateNewsDto } from "../types/update-news.dto";

export class NewsService {
  private readonly SERVER_URL: string;

  constructor(private readonly httpService: EnhancedWithAuthHttpService) {
    this.SERVER_URL = import.meta.env.VITE_BACKEND_URL;
  }

  /** Get all news (approved only) */
  public async getAll(categoryId?: string): Promise<News[]> {
    const url = categoryId ? `news?categoryId=${categoryId}` : "news";

    return this.httpService.get(url);
  }

  /** Get news by ID */
  public async getOne(id: string): Promise<News> {
    return this.httpService.get(`news/${id}`);
  }

  /** Create news */
  public async create(dto: CreateNewsDto): Promise<News> {
    return this.httpService.post<News, CreateNewsDto>("news", dto);
  }

  /** Approve news (admin only) */
  public async approve(id: string): Promise<News> {
    return this.httpService.patch<News, void>(`news/${id}/approve`, undefined);
  }

  /** Update news (admin only) */
  public async update(id: string, dto: UpdateNewsDto): Promise<News> {
    return this.httpService.patch<News, UpdateNewsDto>(`news/${id}`, dto);
  }

  /** Delete news (admin only) */
  public async remove(id: string): Promise<void> {
    return this.httpService.delete<void>(`news/${id}`);
  }

  /** Upload image to Cloudflare R2 */
  public async uploadImage(file: File): Promise<{ url: string }> {
    const { accessToken } = useAuthStore.getState();
    const formData = new FormData();

    formData.append("file", file);

    const res = await fetch(`${this.SERVER_URL}/news/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to upload image");
    }

    return res.json();
  }
}

export const newsService = new NewsService(
  httpFactoryService.createAuthHttpService()
);
