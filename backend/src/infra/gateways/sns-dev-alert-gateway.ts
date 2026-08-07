import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import type { DevAlert, DevAlertGateway } from "../../domain/contracts/gateways/dev-alert-gateway.js";

export class SnsDevAlertGateway implements DevAlertGateway {
  constructor(
    private readonly topicArn: string = process.env.DEV_ALERTS_TOPIC_ARN ?? "",
    private readonly client: SNSClient = new SNSClient({}),
  ) {}

  async alert({ subject, message }: DevAlert): Promise<void> {
    await this.client.send(new PublishCommand({ TopicArn: this.topicArn, Subject: subject, Message: message }));
  }
}
