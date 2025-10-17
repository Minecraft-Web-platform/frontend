export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  publish_permission?: "all" | "admins";
}
