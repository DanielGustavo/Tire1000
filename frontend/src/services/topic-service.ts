import { Service } from "./service";

export interface ThemeTopic {
  id: string;
  title: string;
  color: string;
}

class TopicService extends Service {
  async list(): Promise<ThemeTopic[]> {
    const { data } = await this.client.get<ThemeTopic[]>("/topics");
    return data;
  }
}

export const topicService = new TopicService();
