import type { User } from "../../../domain/entities/user.js";
import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";

export class InMemoryUserRepository implements UserRepository {
  private readonly usersById = new Map<string, User>();

  async findById(id: string): Promise<User | null> {
    return this.usersById.get(id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    for (const user of this.usersById.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async create(user: User): Promise<User> {
    this.usersById.set(user.id, user);
    return user;
  }
}
