import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { BatchGetCommand, DynamoDBDocumentClient, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { ThemeTopic } from "../../domain/entities/theme-topic.js";
import type { ThemeTopicRepository } from "../../domain/contracts/repositories/theme-topic-repository.js";
import {
  fromThemeTopicItem,
  themeTopicPK,
  themeTopicSK,
  type ThemeTopicItem,
} from "../db/dynamodb/items/theme-topic-item.js";

// Aliased defensively: DynamoDB reserves a large, non-obvious set of words for
// ProjectionExpression/FilterExpression, so every projected attribute gets a placeholder.
const THEME_TOPIC_PROJECTION_EXPRESSION = "#id, #title, #color, #createdAt, #updatedAt";
const THEME_TOPIC_PROJECTION_NAMES = {
  "#id": "id",
  "#title": "title",
  "#color": "color",
  "#createdAt": "createdAt",
  "#updatedAt": "updatedAt",
};

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
        ProjectionExpression: THEME_TOPIC_PROJECTION_EXPRESSION,
        ExpressionAttributeNames: THEME_TOPIC_PROJECTION_NAMES,
      }),
    );

    return (result.Items ?? []).map((item) => fromThemeTopicItem(item as ThemeTopicItem));
  }

  async findById(id: string): Promise<ThemeTopic | null> {
    const result = await this.documentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK: themeTopicPK(), SK: themeTopicSK(id) },
        ProjectionExpression: THEME_TOPIC_PROJECTION_EXPRESSION,
        ExpressionAttributeNames: THEME_TOPIC_PROJECTION_NAMES,
      }),
    );

    return result.Item ? fromThemeTopicItem(result.Item as ThemeTopicItem) : null;
  }

  // BatchGetItem caps at 100 keys per request; the ADR-0004 access pattern only ever
  // batches the distinct topicIds of a single page of Themes, well under that limit.
  async findByIds(ids: string[]): Promise<ThemeTopic[]> {
    if (ids.length === 0) return [];

    const result = await this.documentClient.send(
      new BatchGetCommand({
        RequestItems: {
          [this.tableName]: {
            Keys: ids.map((id) => ({ PK: themeTopicPK(), SK: themeTopicSK(id) })),
            ProjectionExpression: THEME_TOPIC_PROJECTION_EXPRESSION,
            ExpressionAttributeNames: THEME_TOPIC_PROJECTION_NAMES,
          },
        },
      }),
    );

    const items = result.Responses?.[this.tableName] ?? [];
    return items.map((item) => fromThemeTopicItem(item as ThemeTopicItem));
  }
}
