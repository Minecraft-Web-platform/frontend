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

  /** Получить все новости (только одобренные) */
  public async getAll(categoryId?: string): Promise<News[]> {
    const url = categoryId ? `news?categoryId=${categoryId}` : "news";

    return this.httpService.get(url);
  }

  /** Получить новость по ID */
  public async getOne(id: string): Promise<News> {
    return this.httpService.get(`news/${id}`);
  }

  /** Создать новость */
  public async create(dto: CreateNewsDto): Promise<News> {
    return this.httpService.post<News, CreateNewsDto>("news", dto);
  }

  /** Одобрить новость (только админ) */
  public async approve(id: string): Promise<News> {
    return this.httpService.patch<News, void>(`news/${id}/approve`, undefined);
  }

  /** Обновить новость (только админ) */
  public async update(id: string, dto: UpdateNewsDto): Promise<News> {
    return this.httpService.patch<News, UpdateNewsDto>(`news/${id}`, dto);
  }

  /** Удалить новость (только админ) */
  public async remove(id: string): Promise<void> {
    return this.httpService.delete<void>(`news/${id}`);
  }

  /** Загрузить изображение в R2 Cloudflare */
  public async uploadImage(file: File): Promise<{ url: string }> {
    const { accessToken } = useAuthStore.getState();
    const formData = new FormData();

    formData.append("file", file);

    const res = await fetch(`${this.SERVER_URL}/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Ошибка при загрузке изображения");
    }

    return res.json();
  }
}

export const newsService = new NewsService(
  httpFactoryService.createAuthHttpService()
);
