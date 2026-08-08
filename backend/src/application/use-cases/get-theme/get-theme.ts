import type { ThemeRepository } from "../../../domain/contracts/repositories/theme-repository.js";
import type { ThemeTopicRepository } from "../../../domain/contracts/repositories/theme-topic-repository.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { toReferenceTextDTO, type ReferenceTextDTO } from "../../dtos/reference-text-dto.js";
import { toThemeDTO, type ThemeDTO } from "../../dtos/theme-dto.js";
import { toTopicDTO, type TopicDTO } from "../../dtos/topic-dto.js";

export interface GetThemeDeps {
  themeRepository: ThemeRepository;
  themeTopicRepository: ThemeTopicRepository;
  themeAssetsBaseUrl: string;
}

export interface GetThemeInput {
  themeId: string;
}

export interface GetThemeOutput {
  theme: ThemeDTO;
  referenceTexts: ReferenceTextDTO[];
  topic: TopicDTO | null;
}

export function createGetTheme({ themeRepository, themeTopicRepository, themeAssetsBaseUrl }: GetThemeDeps) {
  return async function getTheme({ themeId }: GetThemeInput): Promise<GetThemeOutput> {
    const result = await themeRepository.findById(themeId);
    if (!result) throw new NotFoundError("Tema não encontrado");

    const topic = await themeTopicRepository.findById(result.theme.topicId);

    return {
      theme: toThemeDTO(result.theme),
      referenceTexts: result.referenceTexts.map((referenceText) => toReferenceTextDTO(referenceText, themeAssetsBaseUrl)),
      topic: topic ? toTopicDTO(topic) : null,
    };
  };
}
