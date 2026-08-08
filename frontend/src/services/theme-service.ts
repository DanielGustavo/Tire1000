import { Service } from "./service";
import type { ThemeTopic } from "./topic-service";

/** Fallback accent color for a Theme whose Topic failed to resolve. */
export const DEFAULT_THEME_COLOR = "#EDEDED";

export interface Theme {
  id: string;
  title: string;
  enemYear: number | null;
  topicId: string;
}

export type ReferenceTextParagraph =
  | { type: "TEXT"; content: string }
  | { type: "IMAGE"; content: { url: string; font: string } };

export interface ReferenceText {
  id: string;
  order: number;
  font: string;
  paragraphs: ReferenceTextParagraph[];
}

export interface ListThemesParams {
  topicId?: string;
  search?: string;
}

export interface ThemeWithTopic {
  theme: Theme;
  topic: ThemeTopic | null;
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
