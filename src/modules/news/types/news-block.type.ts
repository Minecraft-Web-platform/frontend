export type NewsBlockType = "text" | "image";

export interface NewsBlock {
  type: NewsBlockType;
  content: string;
}
