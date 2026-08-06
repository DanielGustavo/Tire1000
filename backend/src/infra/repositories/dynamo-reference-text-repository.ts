import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import type { ReferenceText } from "../../domain/entities/reference-text.js";
import type { ReferenceTextRepository } from "../../domain/contracts/repositories/reference-text-repository.js";
import {
  fromReferenceTextItem,
  referenceTextPK,
  type ReferenceTextItem,
} from "../db/dynamodb/items/reference-text-item.js";

export class DynamoReferenceTextRepository implements ReferenceTextRepository {
  constructor(
    private readonly tableName: string = process.env.TABLE_NAME ?? "",
    private readonly documentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient({})),
  ) {}

  async listByThemeId(themeId: string): Promise<ReferenceText[]> {
    const result = await this.documentClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": referenceTextPK(themeId) },
      }),
    );

    return (result.Items ?? []).map((item) => fromReferenceTextItem(item as ReferenceTextItem));
  }
}
