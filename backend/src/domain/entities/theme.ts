import { Entity } from "./entity.js";

export interface ThemeProps {
  id: string;
  title: string;
  enemYear: number | null;
  topicId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Theme extends Entity {
  declare readonly type: "THEME";

  readonly title: string;
  readonly enemYear: number | null;
  readonly topicId: string;

  private constructor(props: ThemeProps) {
    super({ id: props.id, type: "THEME", createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.title = props.title;
    this.enemYear = props.enemYear;
    this.topicId = props.topicId;
  }

  static reconstitute(props: ThemeProps): Theme {
    return new Theme(props);
  }

  /** ADR-0003: ordering uses enemYear (Jan 1st of that year) when set, else createdAt. */
  get publicationDate(): Date {
    return this.enemYear !== null ? new Date(Date.UTC(this.enemYear, 0, 1)) : this.createdAt;
  }
}
