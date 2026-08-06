import type { ReferenceText } from "../../entities/reference-text.js";
import type { Theme } from "../../entities/theme.js";

export interface ListThemesFilter {
  topicId?: string;
  search?: string;
}

export interface ThemeWithReferenceTexts {
  theme: Theme;
  referenceTexts: ReferenceText[];
}

export interface ThemeRepository {
  findById(id: string): Promise<ThemeWithReferenceTexts | null>;
  list(filter?: ListThemesFilter): Promise<Theme[]>;
}
