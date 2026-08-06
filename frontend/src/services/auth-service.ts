import { Service } from "./service";

export interface AuthTokens {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  credits: number;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface SignUpResponse {
  user: AuthUser;
  tokens: AuthTokens;
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
