import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { User } from "../domain/user.js";
import type { UserRepository } from "./user-repository.js";

interface UserItem extends User {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
}

function toItem(user: User): UserItem {
  return {
    ...user,
    PK: `USER#${user.id}`,
    SK: `USER#${user.id}`,
    GSI1PK: `USER#${user.email}`,
    GSI1SK: `USER#${user.email}`,
  };
}

function fromItem({ PK: _pk, SK: _sk, GSI1PK: _gsi1pk, GSI1SK: _gsi1sk, ...user }: UserItem): User {
  return user;
}

export class DynamoUserRepository implements UserRepository {
  constructor(
    private readonly tableName: string = process.env.TABLE_NAME ?? "",
    private readonly documentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient({})),
  ) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.documentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK: `USER#${id}`, SK: `USER#${id}` },
      }),
    );

    return result.Item ? fromItem(result.Item as UserItem) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.documentClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :gsi1pk",
        ExpressionAttributeValues: { ":gsi1pk": `USER#${email}` },
        Limit: 1,
      }),
    );

    const item = result.Items?.[0];
    return item ? fromItem(item as UserItem) : null;
  }

  async create(user: User): Promise<User> {
    await this.documentClient.send(
      new PutCommand({ TableName: this.tableName, Item: toItem(user) }),
    );
    return user;
  }
}
