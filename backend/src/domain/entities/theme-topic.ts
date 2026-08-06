import { Entity } from "./entity.js";

export interface ThemeTopicProps {
  id: string;
  title: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ThemeTopic extends Entity {
  declare readonly type: "TOPIC";

  readonly title: string;
  readonly color: string;

  private constructor(props: ThemeTopicProps) {
    super({ id: props.id, type: "TOPIC", createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.title = props.title;
    this.color = props.color;
  }

  static reconstitute(props: ThemeTopicProps): ThemeTopic {
    return new ThemeTopic(props);
  }
}
