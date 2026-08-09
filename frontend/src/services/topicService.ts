import { Service } from "./service";
import type { ThemeTopic } from "../types/topic";

class TopicService extends Service {
  async list(): Promise<ThemeTopic[]> {
    const { data } = await this.client.get<ThemeTopic[]>("/topics");
    return data;
  }
}

export const topicService = new TopicService();
