import type { ThemeRepository, ThemeWithReferenceTexts } from "../../../domain/contracts/repositories/theme-repository.js";
import type { ThemeTopic } from "../../../domain/entities/theme-topic.js";
import type { ThemeTopicRepository } from "../../../domain/contracts/repositories/theme-topic-repository.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";

export interface GetThemeDeps {
  themeRepository: ThemeRepository;
  themeTopicRepository: ThemeTopicRepository;
}

export interface GetThemeInput {
  themeId: string;
}

export interface GetThemeOutput extends ThemeWithReferenceTexts {
  topic: ThemeTopic | null;
}

export function createGetTheme({ themeRepository, themeTopicRepository }: GetThemeDeps) {
  return async function getTheme({ themeId }: GetThemeInput): Promise<GetThemeOutput> {
    const result = await themeRepository.findById(themeId);
    if (!result) throw new NotFoundError("Tema não encontrado");

    const topic = await themeTopicRepository.findById(result.theme.topicId);

    return { ...result, topic };
  };
}
