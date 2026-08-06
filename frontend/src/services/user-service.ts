import { Service } from "./service";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  credits: number;
}

class UserService extends Service {
  async getCurrentUser(): Promise<CurrentUser> {
    const { data } = await this.client.get<CurrentUser>("/users/me");
    return data;
  }
}

export const userService = new UserService();
