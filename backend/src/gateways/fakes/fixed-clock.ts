import type { Clock } from "../clock.js";

export class FixedClock implements Clock {
  constructor(private readonly fixedDate: Date) {}

  now(): Date {
    return this.fixedDate;
  }
}
