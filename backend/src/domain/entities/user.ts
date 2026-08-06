import { Entity } from "./entity.js";

export interface UserProps {
  id: string;
  externalId: string;
  email: string;
  name: string;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewUserProps {
  id: string;
  externalId: string;
  email: string;
  name: string;
}

export class User extends Entity {
  declare readonly type: "USER";

  readonly externalId: string;
  readonly email: string;
  readonly name: string;
  readonly credits: number;

  private constructor(props: UserProps) {
    super({ id: props.id, type: "USER", createdAt: props.createdAt, updatedAt: props.updatedAt });
    this.externalId = props.externalId;
    this.email = props.email;
    this.name = props.name;
    this.credits = props.credits;
  }

  static create({ id, externalId, email, name }: NewUserProps): User {
    const now = new Date();
    return new User({ id, externalId, email, name, credits: 0, createdAt: now, updatedAt: now });
  }

  static reconstitute(props: UserProps): User {
    return new User(props);
  }
}
