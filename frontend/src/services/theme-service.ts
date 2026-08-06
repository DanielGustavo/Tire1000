import { Service } from "./service";

export interface Theme {
  id: string;
  title: string;
  enemYear: number | null;
  topicId: string;
}

export type ReferenceTextParagraph =
  | { type: "TEXT"; content: string }
  | { type: "IMAGE"; content: { fileKey: string; font: string } };

export interface ReferenceText {
  id: string;
  title: string;
  font: string;
  paragraphs: ReferenceTextParagraph[];
}

export interface ListThemesParams {
  topicId?: string;
  search?: string;
}

export interface GetThemeResponse {
  theme: Theme;
  referenceTexts: ReferenceText[];
}

class ThemeService extends Service {
  async list(params: ListThemesParams = {}): Promise<Theme[]> {
    const { data } = await this.client.get<Theme[]>("/themes", { params });
    return data;
  }

  async getById(themeId: string): Promise<GetThemeResponse> {
    const { data } = await this.client.get<GetThemeResponse>(`/themes/${themeId}`);
    return data;
  }
}

export const themeService = new ThemeService();
