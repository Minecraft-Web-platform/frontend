import { NewsBlock } from "./news-block.type";

export interface News {
  id: string;
  title: string;
  author: string;
  isApproved: boolean;
  created_at: string;
  category: {
    id: string;
    name: string;
  };
  blocks: NewsBlock[];
}
