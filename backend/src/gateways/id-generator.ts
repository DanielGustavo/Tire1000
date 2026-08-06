import KSUID from "ksuid";

export interface IdGenerator {
  generate(): Promise<string>;
}

export class KsuidIdGenerator implements IdGenerator {
  async generate(): Promise<string> {
    const id = await KSUID.random();
    return id.string;
  }
}
