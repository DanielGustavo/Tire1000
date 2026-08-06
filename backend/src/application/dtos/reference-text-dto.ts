import type { ReferenceText, ReferenceTextParagraph } from "../../domain/entities/reference-text.js";

export interface ReferenceTextDTO {
  id: string;
  title: string;
  font: string;
  themeId: string;
  paragraphs: ReferenceTextParagraph[];
}

export function toReferenceTextDTO(referenceText: ReferenceText): ReferenceTextDTO {
  return {
    id: referenceText.id,
    title: referenceText.title,
    font: referenceText.font,
    themeId: referenceText.themeId,
    paragraphs: referenceText.paragraphs,
  };
}
