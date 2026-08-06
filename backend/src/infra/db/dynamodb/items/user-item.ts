import { User } from "../../../../domain/entities/user.js";

export interface UserItem {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  id: string;
  type: "USER";
  externalId: string;
  email: string;
  name: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
}

export function userPK(id: string): string {
  return `USER#${id}`;
}

export function userSK(id: string): string {
  return `USER#${id}`;
}

export function userGSI1PK(email: string): string {
  return `USER#${email}`;
}

export function userGSI1SK(email: string): string {
  return `USER#${email}`;
}

export function toUserItem(user: User): UserItem {
  return {
    PK: userPK(user.id),
    SK: userSK(user.id),
    GSI1PK: userGSI1PK(user.email),
    GSI1SK: userGSI1SK(user.email),
    id: user.id,
    type: user.type,
    externalId: user.externalId,
    email: user.email,
    name: user.name,
    credits: user.credits,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function fromUserItem(item: UserItem): User {
  return User.reconstitute({
    id: item.id,
    externalId: item.externalId,
    email: item.email,
    name: item.name,
    credits: item.credits,
    createdAt: new Date(item.createdAt),
    updatedAt: new Date(item.updatedAt),
  });
}
