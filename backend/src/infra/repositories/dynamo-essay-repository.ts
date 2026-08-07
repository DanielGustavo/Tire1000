import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { Essay, EssayStatus } from "../../domain/entities/essay.js";
import type { EssayRepository } from "../../domain/contracts/repositories/essay-repository.js";
import { essayGSI1PK, essayPK, essaySK, fromEssayItem, toEssayItem, type EssayItem } from "../db/dynamodb/items/essay-item.js";

export class DynamoEssayRepository implements EssayRepository {
  constructor(
    private readonly tableName: string = process.env.TABLE_NAME ?? "",
    private readonly documentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient({})),
  ) {}

  async create(essay: Essay): Promise<Essay> {
    await this.documentClient.send(new PutCommand({ TableName: this.tableName, Item: toEssayItem(essay) }));
    return essay;
  }

  async findById(essayId: string): Promise<Essay | null> {
    const result = await this.documentClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :gsi1pk",
        ExpressionAttributeValues: { ":gsi1pk": essayGSI1PK(essayId) },
        Limit: 1,
      }),
    );

    const item = result.Items?.[0];
    return item ? fromEssayItem(item as EssayItem) : null;
  }

  async listByUserId(userId: string): Promise<Essay[]> {
    const result = await this.documentClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk AND begins_with(SK, :essayPrefix)",
        ExpressionAttributeValues: { ":pk": essayPK(userId), ":essayPrefix": "ESSAY#" },
        // Essay ids are KSUIDs, so SK order mirrors submission order — newest first.
        ScanIndexForward: false,
      }),
    );

    return (result.Items ?? []).map((item) => fromEssayItem(item as EssayItem));
  }

  async updateStatus(essay: Essay, { expectedCurrentStatus }: { expectedCurrentStatus: EssayStatus }): Promise<{ applied: boolean }> {
    try {
      await this.documentClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { PK: essayPK(essay.userId), SK: essaySK(essay.id) },
          UpdateExpression:
            "SET #status = :status, #fileKey = :fileKey, #textContent = :textContent, " +
            "#validationAttempts = :validationAttempts, #rejectedAttempts = :rejectedAttempts, " +
            "#rejectionReasons = :rejectionReasons, #evaluationAttempts = :evaluationAttempts, " +
            "#finalScore = :finalScore, #updatedAt = :updatedAt",
          ConditionExpression: "#status = :expectedCurrentStatus",
          ExpressionAttributeNames: {
            "#status": "status",
            "#fileKey": "fileKey",
            "#textContent": "textContent",
            "#validationAttempts": "validationAttempts",
            "#rejectedAttempts": "rejectedAttempts",
            "#rejectionReasons": "rejectionReasons",
            "#evaluationAttempts": "evaluationAttempts",
            "#finalScore": "finalScore",
            "#updatedAt": "updatedAt",
          },
          ExpressionAttributeValues: {
            ":status": essay.status,
            ":expectedCurrentStatus": expectedCurrentStatus,
            ":fileKey": essay.fileKey,
            ":textContent": essay.textContent,
            ":validationAttempts": essay.validationAttempts,
            ":rejectedAttempts": essay.rejectedAttempts,
            ":rejectionReasons": essay.rejectionReasons,
            ":evaluationAttempts": essay.evaluationAttempts,
            ":finalScore": essay.finalScore,
            ":updatedAt": essay.updatedAt.toISOString(),
          },
        }),
      );
      return { applied: true };
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) return { applied: false };
      throw error;
    }
  }
}
