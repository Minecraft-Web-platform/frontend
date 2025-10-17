export interface CreateCategoryDto {
  name: string;
  description?: string;
  publish_permission: "all" | "admins";
}
