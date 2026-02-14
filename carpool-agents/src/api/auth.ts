import { post } from './client';

export type User = {
  id: string;
  name: string;
  email: string;
  femaleOnlyCarpool?: boolean;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export async function signup(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/signup', { name, email, password });
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  return post<AuthResponse>('/auth/login', { email, password });
}
