import type { AxiosInstance } from "axios";
import { httpClient } from "../libs/axios";

export abstract class Service {
  protected readonly client: AxiosInstance;

  constructor(client: AxiosInstance = httpClient) {
    this.client = client;
  }
}
