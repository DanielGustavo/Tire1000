import type { ReferenceText } from "../../../domain/entities/reference-text.js";
import type { Theme } from "../../../domain/entities/theme.js";
import type { ReferenceTextRepository } from "../../../domain/contracts/repositories/reference-text-repository.js";
import type { ThemeRepository } from "../../../domain/contracts/repositories/theme-repository.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";

export interface GetThemeDeps {
  themeRepository: ThemeRepository;
  referenceTextRepository: ReferenceTextRepository;
}

export interface GetThemeInput {
  themeId: string;
}

export interface GetThemeOutput {
  theme: Theme;
  referenceTexts: ReferenceText[];
}

export function createGetTheme({ themeRepository, referenceTextRepository }: GetThemeDeps) {
  return async function getTheme({ themeId }: GetThemeInput): Promise<GetThemeOutput> {
    const theme = await themeRepository.findById(themeId);
    if (!theme) throw new NotFoundError("Tema não encontrado");

    const referenceTexts = await referenceTextRepository.listByThemeId(themeId);

    return { theme, referenceTexts };
  };
}
