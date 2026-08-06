import { apiClient } from "./client";

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

export async function signUp(input: SignUpInput): Promise<SignUpResponse> {
  const { data } = await apiClient.post<SignUpResponse>("/auth/signup", input);
  return data;
}

export interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>("/auth/login", input);
  return data;
}
