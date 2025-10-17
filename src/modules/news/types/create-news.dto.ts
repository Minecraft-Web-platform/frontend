import { NewsBlock } from "./news-block.type";

export interface CreateNewsDto {
  title: string;
  categoryId: string;
  blocks: NewsBlock[];
}
