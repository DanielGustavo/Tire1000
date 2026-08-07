export interface DevAlert {
  subject: string;
  message: string;
}

/** Email alerts to the dev (SNS-backed) — system failures and operational thresholds the spec asks to flag manually. */
export interface DevAlertGateway {
  alert(input: DevAlert): Promise<void>;
}
