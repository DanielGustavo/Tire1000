import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { User } from "../../domain/entities/user.js";
import type { UserRepository } from "../../domain/contracts/repositories/user-repository.js";
import {
  fromUserItem,
  toUserItem,
  userGSI1PK,
  userPK,
  userSK,
  type UserItem,
} from "../db/dynamodb/items/user-item.js";

export class DynamoUserRepository implements UserRepository {
  constructor(
    private readonly tableName: string = process.env.TABLE_NAME ?? "",
    private readonly documentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient({})),
  ) {}

  async findById(id: string): Promise<User | null> {
    const result = await this.documentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK: userPK(id), SK: userSK(id) },
      }),
    );

    return result.Item ? fromUserItem(result.Item as UserItem) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.documentClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :gsi1pk",
        ExpressionAttributeValues: { ":gsi1pk": userGSI1PK(email) },
        Limit: 1,
      }),
    );

    const item = result.Items?.[0];
    return item ? fromUserItem(item as UserItem) : null;
  }

  async create(user: User): Promise<User> {
    await this.documentClient.send(new PutCommand({ TableName: this.tableName, Item: toUserItem(user) }));
    return user;
  }
}
