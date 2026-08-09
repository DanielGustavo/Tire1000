import { Service } from "./service";
import type { CurrentUser } from "../types/user";

class UserService extends Service {
  async getCurrentUser(): Promise<CurrentUser> {
    const { data } = await this.client.get<CurrentUser>("/users/me");
    return data;
  }
}

export const userService = new UserService();
