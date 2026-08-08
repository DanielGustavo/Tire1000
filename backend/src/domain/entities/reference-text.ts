import { Entity } from "./entity.js";

export type ReferenceTextParagraph =
  | { type: "TEXT"; content: string }
  | { type: "IMAGE"; content: { fileKey: string; font: string } };

export interface ReferenceTextProps {
  id: string;
  order: number;
  font: string;
  paragraphs: ReferenceTextParagraph[];
  themeId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ReferenceText extends Entity {
  declare readonly type: "REFERENCE_TEXT";

  readonly order: number;
  readonly font: string;
  readonly paragraphs: ReferenceTextParagraph[];
  readonly themeId: string;

  private constructor(props: ReferenceTextProps) {
    super({ id: props.id, type: "REFERENCE_TEXT", createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.order = props.order;
    this.font = props.font;
    this.paragraphs = props.paragraphs;
    this.themeId = props.themeId;
  }

  static reconstitute(props: ReferenceTextProps): ReferenceText {
    return new ReferenceText(props);
  }
}
