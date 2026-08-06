import type { IdGenerator } from "../../contracts/id-generator.js";

export class SequentialIdGenerator implements IdGenerator {
  private counter = 0;

  async generate(): Promise<string> {
    this.counter += 1;
    return `fake-id-${this.counter}`;
  }
}
