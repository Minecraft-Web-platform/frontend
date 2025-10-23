export interface NewsPreview {
  id: string;
  title: string;
  author: string;
  authorId: number;
  isApproved: boolean;
  created_at: string;
}

export interface NewsCategory {
  id: string;
  name: string;
  description: string;
  publish_permission: "all" | "admins";
  news: NewsPreview[];
}
