import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import type { EssayCost } from "../../domain/entities/essay-cost.js";
import type { EssayCostRepository } from "../../domain/contracts/repositories/essay-cost-repository.js";
import { toEssayCostItem } from "../db/dynamodb/items/essay-cost-item.js";

export class DynamoEssayCostRepository implements EssayCostRepository {
  constructor(
    private readonly tableName: string = process.env.TABLE_NAME ?? "",
    private readonly documentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient({})),
  ) {}

  async create(essayCost: EssayCost): Promise<EssayCost> {
    await this.documentClient.send(new PutCommand({ TableName: this.tableName, Item: toEssayCostItem(essayCost) }));
    return essayCost;
  }
}
