import type { User } from "../../entities/user.js";

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  incrementCredits(userId: string, amount: number): Promise<User>;
  /**
   * Debits `amount` credits from the user, conditioned on the stored balance being at least
   * `amount`. `applied: false` means the balance wasn't enough at write time — e.g. a concurrent
   * essay confirmation for the same user already spent it — callers must treat that as a no-op,
   * not an error (same conditional-update idempotency spirit as ADR-0007).
   */
  decrementCredits(userId: string, amount: number): Promise<{ applied: boolean }>;
}
