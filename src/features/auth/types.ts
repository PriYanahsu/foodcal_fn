export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  userName: string;
  fullName: string;
  email: string;
  password: string;
  gender: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}
