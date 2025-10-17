export interface NewsCategory {
  id: string;
  name: string;
  description?: string;
  publish_permission: "all" | "admins";
}
