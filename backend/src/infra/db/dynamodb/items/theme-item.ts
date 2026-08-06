import { Theme } from "../../../../domain/entities/theme.js";

export interface ThemeItem {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: string;
  id: string;
  type: "THEME";
  title: string;
  enemYear: number | null;
  topicId: string;
  createdAt: string;
  updatedAt: string;
}

function publicationDateSegment(theme: Theme): string {
  return theme.publicationDate.toISOString().slice(0, 10);
}

export function themePK(): string {
  return "THEMES";
}

export function themeSK(theme: Theme): string {
  return `THEME#${publicationDateSegment(theme)}#${theme.id}`;
}

export function themeGSI1PK(topicId: string): string {
  return `TOPIC#${topicId}`;
}

export function themeGSI1SK(theme: Theme): string {
  return themeSK(theme);
}

export function themeGSI2PK(id: string): string {
  return `THEME#${id}`;
}

export function themeGSI2SK(id: string): string {
  return `THEME#${id}`;
}

export function toThemeItem(theme: Theme): ThemeItem {
  return {
    PK: themePK(),
    SK: themeSK(theme),
    GSI1PK: themeGSI1PK(theme.topicId),
    GSI1SK: themeGSI1SK(theme),
    GSI2PK: themeGSI2PK(theme.id),
    GSI2SK: themeGSI2SK(theme.id),
    id: theme.id,
    type: theme.type,
    title: theme.title,
    enemYear: theme.enemYear,
    topicId: theme.topicId,
    createdAt: theme.createdAt.toISOString(),
    updatedAt: theme.updatedAt.toISOString(),
  };
}

export function fromThemeItem(item: ThemeItem): Theme {
  return Theme.reconstitute({
    id: item.id,
    title: item.title,
    enemYear: item.enemYear,
    topicId: item.topicId,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  });
}
