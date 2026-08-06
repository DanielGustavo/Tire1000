import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { ThemeTopic } from "../../domain/entities/theme-topic.js";
import type { ThemeTopicRepository } from "../../domain/contracts/repositories/theme-topic-repository.js";
import { fromThemeTopicItem, themeTopicPK, type ThemeTopicItem } from "../db/dynamodb/items/theme-topic-item.js";

export class DynamoThemeTopicRepository implements ThemeTopicRepository {
  constructor(
    private readonly tableName: string = process.env.TABLE_NAME ?? "",
    private readonly documentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient({})),
  ) {}

  async list(): Promise<ThemeTopic[]> {
    const result = await this.documentClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": themeTopicPK() },
      }),
    );

    return (result.Items ?? []).map((item) => fromThemeTopicItem(item as ThemeTopicItem));
  }
}
