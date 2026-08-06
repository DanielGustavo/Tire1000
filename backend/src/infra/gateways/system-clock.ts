import type { Clock } from "../../domain/contracts/gateways/clock.js";

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}
