export interface User {
  id: string;
  email: string;
  name: string;
  fullName: string;
  language: string;
  avatar?: string;
  roles: string[];
}

export interface Session {
  user: User;
  token: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}