import type { Essay, EssayStatus } from "../../domain/entities/essay.js";

/**
 * Scoped to what the Revisão result screen needs (ticket 06) — id, status, rejection reasons, and the
 * denormalized theme fields. Ticket 07's GetEssayDetail is expected to extend this with textContent,
 * highlights and scores once EvaluateEssay exists.
 */
export interface EssayDTO {
  id: string;
  status: EssayStatus;
  rejectionReasons: string[];
  themeId: string;
  themeTitle: string;
  topicColor: string;
  createdAt: string;
}

export function toEssayDTO(essay: Essay): EssayDTO {
  return {
    id: essay.id,
    status: essay.status,
    rejectionReasons: essay.rejectionReasons,
    themeId: essay.themeId,
    themeTitle: essay.themeTitle,
    topicColor: essay.topicColor,
    createdAt: essay.createdAt.toISOString(),
  };
}
