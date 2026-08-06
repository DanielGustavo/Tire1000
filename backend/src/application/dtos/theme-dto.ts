import type { Theme } from "../../domain/entities/theme.js";

export interface ThemeDTO {
  id: string;
  title: string;
  enemYear: number | null;
  topicId: string;
}

export function toThemeDTO(theme: Theme): ThemeDTO {
  return { id: theme.id, title: theme.title, enemYear: theme.enemYear, topicId: theme.topicId };
}
