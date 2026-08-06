import { ConditionalCheckFailedException, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import type { Checkout, CheckoutStatus } from "../../domain/entities/checkout.js";
import type { CheckoutRepository } from "../../domain/contracts/repositories/checkout-repository.js";
import { checkoutPK, checkoutSK, fromCheckoutItem, toCheckoutItem, type CheckoutItem } from "../db/dynamodb/items/checkout-item.js";

export class DynamoCheckoutRepository implements CheckoutRepository {
  constructor(
    private readonly tableName: string = process.env.TABLE_NAME ?? "",
    private readonly documentClient: DynamoDBDocumentClient = DynamoDBDocumentClient.from(new DynamoDBClient({})),
  ) {}

  async create(checkout: Checkout): Promise<Checkout> {
    await this.documentClient.send(new PutCommand({ TableName: this.tableName, Item: toCheckoutItem(checkout) }));
    return checkout;
  }

  async findByExternalId(externalId: string): Promise<Checkout | null> {
    const result = await this.documentClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK: checkoutPK(externalId), SK: checkoutSK(externalId) },
      }),
    );

    return result.Item ? fromCheckoutItem(result.Item as CheckoutItem) : null;
  }

  async updateStatus(checkout: Checkout, { expectedCurrentStatus }: { expectedCurrentStatus: CheckoutStatus }): Promise<{ applied: boolean }> {
    try {
      await this.documentClient.send(
        new UpdateCommand({
          TableName: this.tableName,
          Key: { PK: checkoutPK(checkout.externalId), SK: checkoutSK(checkout.externalId) },
          UpdateExpression: "SET #status = :status, #amountInCents = :amountInCents, #updatedAt = :updatedAt",
          ConditionExpression: "#status = :expectedCurrentStatus",
          ExpressionAttributeNames: {
            "#status": "status",
            "#amountInCents": "amountInCents",
            "#updatedAt": "updatedAt",
          },
          ExpressionAttributeValues: {
            ":status": checkout.status,
            ":expectedCurrentStatus": expectedCurrentStatus,
            ":amountInCents": checkout.amountInCents,
            ":updatedAt": checkout.updatedAt.toISOString(),
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
