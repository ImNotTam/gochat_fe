export interface User {
    id: string;
    username: string;
  }
  
  export interface AuthResponse {
    id: string;
    username: string;
    accessToken: string;
    refreshToken: string;
  }
  
  export interface LoginRequest {
    email: string;
    password: string;
  }
  
  export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
  }
  