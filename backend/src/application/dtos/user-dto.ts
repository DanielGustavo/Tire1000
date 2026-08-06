import type { User } from "../../domain/entities/user.js";

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  credits: number;
}

export function toUserDTO(user: User): UserDTO {
  return { id: user.id, email: user.email, name: user.name, credits: user.credits };
}
