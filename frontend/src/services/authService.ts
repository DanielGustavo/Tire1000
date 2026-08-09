import { Service } from "./service";
import type { AuthUser } from "../types/auth";

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  creditsQty?: number;
}

export interface SignUpResponse {
  user: AuthUser;
  tokens: AuthTokens;
  checkoutUrl: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

class AuthService extends Service {
  async signUp(input: SignUpInput): Promise<SignUpResponse> {
    const { data } = await this.client.post<SignUpResponse>("/auth/signup", input);
    return data;
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const { data } = await this.client.post<AuthTokens>("/auth/login", input);
    return data;
  }
}

export const authService = new AuthService();
