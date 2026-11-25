export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  roles: string[];
}

export interface AuthResult {
  user: User;
  access_token?: string | null;
  refresh_token?: string | null;
  token_type?: string;
}

export interface RegisterRequest {
  full_name: string;
  email: string;
  username: string;
  password: string;
  confirm_password: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
  remember_me: boolean;
}
