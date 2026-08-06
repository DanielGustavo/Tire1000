import { User } from "../../../../domain/entities/user.js";

export interface UserItem {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  GSI2PK: string;
  GSI2SK: string;
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

// GSI2 resolves a User by their Cognito sub (externalId) — needed to identify the
// logged-in user from JWT claims on authenticated routes (see ADR-0006).
export function userGSI2PK(externalId: string): string {
  return `USER_EXTERNAL_ID#${externalId}`;
}

export function userGSI2SK(externalId: string): string {
  return `USER_EXTERNAL_ID#${externalId}`;
}

export function toUserItem(user: User): UserItem {
  return {
    PK: userPK(user.id),
    SK: userSK(user.id),
    GSI1PK: userGSI1PK(user.email),
    GSI1SK: userGSI1SK(user.email),
    GSI2PK: userGSI2PK(user.externalId),
    GSI2SK: userGSI2SK(user.externalId),
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
