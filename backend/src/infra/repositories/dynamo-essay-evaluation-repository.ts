import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { EssayEvaluation } from "../../domain/entities/essay-evaluation.js";
import type { EssayEvaluationRepository } from "../../domain/contracts/repositories/essay-evaluation-repository.js";
import {
  essayEvaluationPK,
  essayEvaluationSK,
  fromEssayEvaluationItem,
  toEssayEvaluationItem,
  type EssayEvaluationItem,
} from "../db/dynamodb/items/essay-evaluation-item.js";

export class DynamoEssayEvaluationRepository implements EssayEvaluationRepository {
  constructor(
    private readonly tableName: string = process.env.TABLE_NAME ?? "",
    private readonly documentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient({})),
  ) {}

  async create(essayEvaluation: EssayEvaluation): Promise<EssayEvaluation> {
    await this.documentClient.send(new PutCommand({ TableName: this.tableName, Item: toEssayEvaluationItem(essayEvaluation) }));
    return essayEvaluation;
  }

  async findByEssayId(essayId: string): Promise<EssayEvaluation | null> {
    const result = await this.documentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK: essayEvaluationPK(essayId), SK: essayEvaluationSK(essayId) },
      }),
    );

    return result.Item ? fromEssayEvaluationItem(result.Item as EssayEvaluationItem) : null;
  }
}
