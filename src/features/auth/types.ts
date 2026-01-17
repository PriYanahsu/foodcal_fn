export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  username: string;
  email: string;
  gender: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  token?: string;
  error?: string;
}
