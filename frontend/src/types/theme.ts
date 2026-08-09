import type { ThemeTopic } from "./topic";

export interface Theme {
  id: string;
  title: string;
  enemYear: number | null;
  topicId: string;
}

export type ReferenceTextParagraph =
  | { type: "TEXT"; content: string }
  | { type: "IMAGE"; content: { url: string; font: string } };

export interface ReferenceText {
  id: string;
  order: number;
  font: string;
  paragraphs: ReferenceTextParagraph[];
}

export interface ThemeWithTopic {
  theme: Theme;
  topic: ThemeTopic | null;
}
