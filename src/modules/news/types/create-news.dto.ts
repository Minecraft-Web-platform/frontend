export type NewsBlockType = "text" | "image";

export interface CreateNewsBlockDto {
  type: NewsBlockType;
  content: string;
  order: number;
}

export interface CreateNewsDto {
  title: string;
  categoryId: string;
  blocks: CreateNewsBlockDto[];
}
