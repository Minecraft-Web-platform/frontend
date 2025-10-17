import { NewsBlock } from "./news-block.type";

export interface UpdateNewsDto {
  title?: string;
  categoryId?: string;
  blocks?: NewsBlock[];
}
