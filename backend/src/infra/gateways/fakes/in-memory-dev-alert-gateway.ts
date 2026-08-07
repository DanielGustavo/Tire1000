import type { DevAlert, DevAlertGateway } from "../../../domain/contracts/gateways/dev-alert-gateway.js";

export class InMemoryDevAlertGateway implements DevAlertGateway {
  readonly alerts: DevAlert[] = [];

  async alert(input: DevAlert): Promise<void> {
    this.alerts.push(input);
  }
}
