import { EnhancedWithAuthHttpService } from "../../../shared/services/http-auth.service";
import { httpFactoryService } from "../../../shared/services/http-factory.service";

import { NewsCategory } from "../types/news-category.type";
import { UpdateCategoryDto } from "../types/update-category.dto";
import { CreateCategoryDto } from "../types/create-category.dto";

export class NewsCategoryService {
  constructor(private readonly httpService: EnhancedWithAuthHttpService) {}

  /** Получить все категории */
  public async getAll(): Promise<NewsCategory[]> {
    return this.httpService.get("categories");
  }

  /** Получить категорию по ID */
  public async getOne(id: string): Promise<NewsCategory> {
    return this.httpService.get(`categories/${id}`);
  }

  /** Создать категорию (только админ) */
  public async create(dto: CreateCategoryDto): Promise<NewsCategory> {
    return this.httpService.post<NewsCategory, CreateCategoryDto>(
      "categories",
      dto
    );
  }

  /** Обновить категорию (только админ) */
  public async update(
    id: string,
    dto: UpdateCategoryDto
  ): Promise<NewsCategory> {
    return this.httpService.patch<NewsCategory, UpdateCategoryDto>(
      `categories/${id}`,
      dto
    );
  }

  /** Удалить категорию (только админ) */
  public async remove(id: string): Promise<void> {
    return this.httpService.delete<void>(`categories/${id}`);
  }
}

export const newsCategoryService = new NewsCategoryService(
  httpFactoryService.createAuthHttpService()
);
