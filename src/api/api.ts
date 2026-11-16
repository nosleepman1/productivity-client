import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAppLanguage } from "@/i18n";

export interface ApiError {
  statusCode: number;
  code: string;
  message: string | string[];
}

interface ApiAuthHandlers {
  getAccessToken: () => string | null;
  onTokenRefreshed: (accessToken: string) => void;
  onAuthFailure: () => void;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

const DEFAULT_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

const AUTH_BYPASS_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/google",
  "/auth/refresh",
  "/auth/logout",
];

let authHandlers: ApiAuthHandlers = {
  getAccessToken: () => null,
  onTokenRefreshed: () => undefined,
  onAuthFailure: () => undefined,
};

export function configureApiAuth(handlers: ApiAuthHandlers): void {
  authHandlers = handlers;
}

export const api: AxiosInstance = axios.create({
  baseURL: DEFAULT_BASE_URL,
  withCredentials: true,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use((config) => {
  const token = authHandlers.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers["Accept-Language"] = getAppLanguage();
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
}

function shouldSkipRefresh(url?: string): boolean {
  if (!url) return false;
  return AUTH_BYPASS_PATHS.some((path) => url.includes(path));
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      shouldSkipRefresh(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<RefreshResponse>(
        `${DEFAULT_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        },
      );

      authHandlers.onTokenRefreshed(data.accessToken);
      flushQueue(null, data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      authHandlers.onAuthFailure();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export function extractApiError(error: unknown): ApiError {
  if (axios.isAxiosError<ApiError>(error) && error.response?.data) {
    return error.response.data;
  }
  return {
    statusCode: 500,
    code: "NETWORK_ERROR",
    message: "Impossible de joindre le serveur.",
  };
}
