import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { Theme } from "../../domain/entities/theme.js";
import type { ListThemesFilter, ThemeRepository } from "../../domain/contracts/repositories/theme-repository.js";
import {
  fromThemeItem,
  themeGSI1PK,
  themeGSI2PK,
  themePK,
  type ThemeItem,
} from "../db/dynamodb/items/theme-item.js";

export class DynamoThemeRepository implements ThemeRepository {
  constructor(
    private readonly tableName: string = process.env.TABLE_NAME ?? "",
    private readonly documentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient({})),
  ) {}

  async findById(id: string): Promise<Theme | null> {
    const result = await this.documentClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "GSI2",
        KeyConditionExpression: "GSI2PK = :gsi2pk",
        ExpressionAttributeValues: { ":gsi2pk": themeGSI2PK(id) },
        Limit: 1,
      }),
    );

    const item = result.Items?.[0];
    return item ? fromThemeItem(item as ThemeItem) : null;
  }

  async list({ topicId, search }: ListThemesFilter = {}): Promise<Theme[]> {
    // DynamoDB's `contains` is case-sensitive; there's no normalized/lowercased attribute
    // in the data model to search against, so title search is case-sensitive for now.
    const searchValue = search ? { ":search": search } : {};

    const keyCondition = topicId
      ? {
          IndexName: "GSI1",
          KeyConditionExpression: "GSI1PK = :gsi1pk AND begins_with(GSI1SK, :themePrefix)",
          ExpressionAttributeValues: { ":gsi1pk": themeGSI1PK(topicId), ":themePrefix": "THEME#", ...searchValue },
        }
      : {
          KeyConditionExpression: "PK = :pk",
          ExpressionAttributeValues: { ":pk": themePK(), ...searchValue },
        };

    const result = await this.documentClient.send(
      new QueryCommand({
        TableName: this.tableName,
        FilterExpression: search ? "contains(title, :search)" : undefined,
        ScanIndexForward: false,
        ...keyCondition,
      }),
    );

    return (result.Items ?? []).map((item) => fromThemeItem(item as ThemeItem));
  }
}
