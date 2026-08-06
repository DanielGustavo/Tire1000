import type { User } from "../../entities/user.js";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  incrementCredits(userId: string, amount: number): Promise<User>;
}
