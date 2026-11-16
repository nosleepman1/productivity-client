import { api } from "@/api/api";
import type {
  AuthTokensResponse,
  AuthUser,
  ChangeEmailConfirmDto,
  ChangeEmailRequestDto,
  ChangePasswordConfirmDto,
  DeleteAccountDto,
  ForgotPasswordDto,
  GoogleLoginDto,
  LoginDto,
  LoginResponse,
  MessageResponse,
  RegisterDto,
  ResendEmailDto,
  ResetPasswordDto,
  SessionItem,
  VerifyEmailDto,
} from "@/types/auth";

export const authService = {
  async login(payload: LoginDto): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", payload);
    return data;
  },

  async loginWithGoogle(payload: GoogleLoginDto): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/google", payload);
    return data;
  },

  async register(payload: RegisterDto): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>("/auth/register", payload);
    return data;
  },

  async verifyEmail(payload: VerifyEmailDto): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>(
      "/auth/email/verify",
      payload,
    );
    return data;
  },

  async resendVerification(payload: ResendEmailDto): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>(
      "/auth/email/resend",
      payload,
    );
    return data;
  },

  async forgotPassword(payload: ForgotPasswordDto): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>(
      "/auth/password/forgot",
      payload,
    );
    return data;
  },

  async resetPassword(payload: ResetPasswordDto): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>(
      "/auth/password/reset",
      payload,
    );
    return data;
  },

  async requestEmailChange(
    payload: ChangeEmailRequestDto,
  ): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>(
      "/auth/email/change/request",
      payload,
    );
    return data;
  },

  async confirmEmailChange(
    payload: ChangeEmailConfirmDto,
  ): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>(
      "/auth/email/change/confirm",
      payload,
    );
    return data;
  },

  async requestPasswordChange(): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>(
      "/auth/password/change/request",
    );
    return data;
  },

  async confirmPasswordChange(
    payload: ChangePasswordConfirmDto,
  ): Promise<MessageResponse> {
    const { data } = await api.post<MessageResponse>(
      "/auth/password/change/confirm",
      payload,
    );
    return data;
  },

  async refresh(): Promise<AuthTokensResponse> {
    const { data } = await api.post<AuthTokensResponse>("/auth/refresh");
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async logoutAll(): Promise<void> {
    await api.post("/auth/logout-all");
  },

  async getSessions(): Promise<SessionItem[]> {
    const { data } = await api.get<SessionItem[]>("/auth/sessions");
    return data;
  },

  async revokeSession(sessionId: string): Promise<void> {
    await api.delete(`/auth/sessions/${sessionId}`);
  },

  async getMe(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>("/auth/me");
    return data;
  },

  async deleteAccount(payload: DeleteAccountDto): Promise<void> {
    await api.delete("/auth/me", { data: payload });
  },
};
