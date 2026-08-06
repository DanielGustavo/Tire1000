import type { Theme } from "../../entities/theme.js";

export interface ListThemesFilter {
  topicId?: string;
  search?: string;
}

export interface ThemeRepository {
  findById(id: string): Promise<Theme | null>;
  list(filter?: ListThemesFilter): Promise<Theme[]>;
}
