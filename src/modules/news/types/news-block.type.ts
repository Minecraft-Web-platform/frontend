export type NewsBlockType = "text" | "image";

export interface NewsBlock {
  id: string;
  type: NewsBlockType;
  content: string;
  order: number;
}
