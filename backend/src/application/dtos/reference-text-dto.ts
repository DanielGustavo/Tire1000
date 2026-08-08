import type { ReferenceText } from "../../domain/entities/reference-text.js";

export type ReferenceTextParagraphDTO =
  | { type: "TEXT"; content: string }
  | { type: "IMAGE"; content: { url: string; font: string } };

export interface ReferenceTextDTO {
  id: string;
  order: number;
  font: string;
  themeId: string;
  paragraphs: ReferenceTextParagraphDTO[];
}

/** `themeAssetsBaseUrl` is the CDN origin (`THEME_ASSETS_CDN_DOMAIN`) — turns each IMAGE paragraph's raw `fileKey` into a public URL so the client never needs to know where theme assets are hosted. */
export function toReferenceTextDTO(referenceText: ReferenceText, themeAssetsBaseUrl: string): ReferenceTextDTO {
  return {
    id: referenceText.id,
    order: referenceText.order,
    font: referenceText.font,
    themeId: referenceText.themeId,
    paragraphs: referenceText.paragraphs.map((paragraph) =>
      paragraph.type === "IMAGE"
        ? { type: "IMAGE", content: { url: `${themeAssetsBaseUrl}/${paragraph.content.fileKey}`, font: paragraph.content.font } }
        : paragraph,
    ),
  };
}
