export type UserRole = "USER" | "ADMIN";

export interface AuthUser {
  id: string;
  role: UserRole;
  email: string;
  name: string;
  sessionId?: string;
}

export interface AuthTokensResponse {
  accessToken: string;
  expiresIn: number;
}

export interface LoginResponse extends AuthTokensResponse {
  user: AuthUser;
}

export interface MessageResponse {
  message: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface GoogleLoginDto {
  idToken: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface VerifyEmailDto {
  email: string;
  code: string;
}

export interface ResendEmailDto {
  email: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  email: string;
  code: string;
  newPassword: string;
}

export interface ChangeEmailRequestDto {
  newEmail: string;
  currentPassword?: string;
}

export interface ChangeEmailConfirmDto {
  newEmail: string;
  code: string;
}

export interface ChangePasswordRequestDto {
  currentPassword?: string;
}

export interface ChangePasswordConfirmDto {
  code: string;
  newPassword: string;
}

export interface DeleteAccountDto {
  password?: string;
  confirmationText?: string;
}

export interface SessionItem {
  id: string;
  appareil: string | null;
  ip: string | null;
  creeLe: string;
  expireLe: string;
  actuelle: boolean;
}
