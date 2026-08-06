import KSUID from "ksuid";
import type { IdGenerator } from "../contracts/id-generator.js";

export class KsuidIdGenerator implements IdGenerator {
  async generate(): Promise<string> {
    const id = await KSUID.random();
    return id.string;
  }
}
