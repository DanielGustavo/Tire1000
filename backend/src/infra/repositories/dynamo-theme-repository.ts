import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { Theme } from "../../domain/entities/theme.js";
import type {
  ListThemesFilter,
  ThemeRepository,
  ThemeWithReferenceTexts,
} from "../../domain/contracts/repositories/theme-repository.js";
import {
  fromThemeItem,
  themeGSI1PK,
  themeGSI2PK,
  themePK,
  type ThemeItem,
} from "../db/dynamodb/items/theme-item.js";
import { fromReferenceTextItem, type ReferenceTextItem } from "../db/dynamodb/items/reference-text-item.js";

// Aliased defensively: DynamoDB reserves a large, non-obvious set of words for
// ProjectionExpression/FilterExpression, so every projected attribute gets a placeholder.
const THEME_PROJECTION_EXPRESSION = "#id, #title, #enemYear, #topicId, #createdAt, #updatedAt";
const THEME_PROJECTION_NAMES = {
  "#id": "id",
  "#title": "title",
  "#enemYear": "enemYear",
  "#topicId": "topicId",
  "#createdAt": "createdAt",
  "#updatedAt": "updatedAt",
};

// GSI2 returns the Theme together with its ReferenceTexts (they share GSI2PK = THEME#<themeId>
// by design, see ADR-0004) — the projection covers both entities' attributes plus #type to split them.
const THEME_WITH_REFERENCE_TEXTS_PROJECTION_EXPRESSION =
  "#type, #id, #title, #enemYear, #topicId, #order, #font, #paragraphs, #themeId, #createdAt, #updatedAt";
const THEME_WITH_REFERENCE_TEXTS_PROJECTION_NAMES = {
  ...THEME_PROJECTION_NAMES,
  "#type": "type",
  "#order": "order",
  "#font": "font",
  "#paragraphs": "paragraphs",
  "#themeId": "themeId",
};

export class DynamoThemeRepository implements ThemeRepository {
  constructor(
    private readonly tableName: string = process.env.TABLE_NAME ?? "",
    private readonly documentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient({})),
  ) {}

  async findById(id: string): Promise<ThemeWithReferenceTexts | null> {
    const result = await this.documentClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "GSI2",
        KeyConditionExpression: "GSI2PK = :gsi2pk",
        ExpressionAttributeValues: { ":gsi2pk": themeGSI2PK(id) },
        ProjectionExpression: THEME_WITH_REFERENCE_TEXTS_PROJECTION_EXPRESSION,
        ExpressionAttributeNames: THEME_WITH_REFERENCE_TEXTS_PROJECTION_NAMES,
      }),
    );

    const items = result.Items ?? [];
    const themeItem = items.find((item) => item.type === "THEME");
    if (!themeItem) return null;

    const referenceTexts = items
      .filter((item) => item.type === "REFERENCE_TEXT")
      .map((item) => fromReferenceTextItem(item as ReferenceTextItem));

    return { theme: fromThemeItem(themeItem as ThemeItem), referenceTexts };
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
        FilterExpression: search ? "contains(#title, :search)" : undefined,
        ProjectionExpression: THEME_PROJECTION_EXPRESSION,
        ExpressionAttributeNames: THEME_PROJECTION_NAMES,
        ScanIndexForward: false,
        ...keyCondition,
      }),
    );

    return (result.Items ?? []).map((item) => fromThemeItem(item as ThemeItem));
  }
}
