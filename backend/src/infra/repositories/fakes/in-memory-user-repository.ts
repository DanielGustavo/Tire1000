import { User } from "../../../domain/entities/user.js";
import type { UserRepository } from "../../../domain/contracts/repositories/user-repository.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";

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

  async incrementCredits(userId: string, amount: number): Promise<User> {
    const user = this.usersById.get(userId);
    if (!user) throw new NotFoundError("Usuário não encontrado");

    const updated = User.reconstitute({
      id: user.id,
      externalId: user.externalId,
      email: user.email,
      name: user.name,
      credits: user.credits + amount,
      createdAt: user.createdAt,
      updatedAt: new Date(),
    });
    this.usersById.set(userId, updated);
    return updated;
  }
}
