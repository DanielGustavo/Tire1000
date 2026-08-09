import { Service } from "./service";
import type { ThemeTopic } from "../types/topic";
import type { ReferenceText, Theme, ThemeWithTopic } from "../types/theme";

/** Fallback accent color for a Theme whose Topic failed to resolve. */
export const DEFAULT_THEME_COLOR = "#EDEDED";

export interface ListThemesParams {
  topicId?: string;
  search?: string;
}

export interface GetThemeResponse {
  theme: Theme;
  referenceTexts: ReferenceText[];
  topic: ThemeTopic | null;
}

class ThemeService extends Service {
  async list(params: ListThemesParams = {}): Promise<ThemeWithTopic[]> {
    const { data } = await this.client.get<ThemeWithTopic[]>("/themes", { params });
    return data;
  }

  async getById(themeId: string): Promise<GetThemeResponse> {
    const { data } = await this.client.get<GetThemeResponse>(`/themes/${themeId}`);
    return data;
  }
}

export const themeService = new ThemeService();
