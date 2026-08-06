import type { Theme } from "../../../domain/entities/theme.js";
import type { ThemeRepository } from "../../../domain/contracts/repositories/theme-repository.js";

export interface ListThemesDeps {
  themeRepository: ThemeRepository;
}

export interface ListThemesInput {
  topicId?: string;
  search?: string;
}

export function createListThemes({ themeRepository }: ListThemesDeps) {
  return async function listThemes({ topicId, search }: ListThemesInput = {}): Promise<Theme[]> {
    return themeRepository.list({ topicId, search });
  };
}
