import { ReferenceText, type ReferenceTextParagraph } from "../../../../domain/entities/reference-text.js";

export interface ReferenceTextItem {
  PK: string;
  SK: string;
  GSI2PK: string;
  GSI2SK: string;
  id: string;
  type: "REFERENCE_TEXT";
  title: string;
  font: string;
  paragraphs: ReferenceTextParagraph[];
  themeId: string;
  createdAt: string;
  updatedAt: string;
}

export function referenceTextPK(themeId: string): string {
  return `REFERENCE_TEXT#${themeId}`;
}

export function referenceTextSK(referenceTextId: string): string {
  return `REFERENCE_TEXT#${referenceTextId}`;
}

export function referenceTextGSI2PK(themeId: string): string {
  return `THEME#${themeId}`;
}

export function referenceTextGSI2SK(referenceTextId: string): string {
  return `REFERENCE_TEXT#${referenceTextId}`;
}

export function toReferenceTextItem(referenceText: ReferenceText): ReferenceTextItem {
  return {
    PK: referenceTextPK(referenceText.themeId),
    SK: referenceTextSK(referenceText.id),
    GSI2PK: referenceTextGSI2PK(referenceText.themeId),
    GSI2SK: referenceTextGSI2SK(referenceText.id),
    id: referenceText.id,
    type: referenceText.type,
    title: referenceText.title,
    font: referenceText.font,
    paragraphs: referenceText.paragraphs,
    themeId: referenceText.themeId,
    createdAt: referenceText.createdAt.toISOString(),
    updatedAt: referenceText.updatedAt.toISOString(),
  };
}

export function fromReferenceTextItem(item: ReferenceTextItem): ReferenceText {
  return ReferenceText.reconstitute({
    id: item.id,
    title: item.title,
    font: item.font,
    paragraphs: item.paragraphs,
    themeId: item.themeId,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  });
}
