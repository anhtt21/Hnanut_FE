import { API_BASE_URL } from "@/config/api";
import { ApiError } from "@/services/apiError";
import {
  clearAuthTokens,
  getAuthTokens,
  saveAuthTokens,
} from "@/services/authTokenStore";
import type { AuthResponse, AuthTokens } from "@/types/auth";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  retryOnUnauthorized?: boolean;
};

let refreshPromise: Promise<AuthTokens | null> | null = null;

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  return sendRequest<T>(path, options);
}

async function sendRequest<T>(
  path: string,
  options: ApiRequestOptions,
): Promise<T> {
  const headers = new Headers(options.headers);
  const tokens = options.auth === false ? null : await getAuthTokens();

  if (tokens?.accessToken) {
    headers.set("Authorization", `Bearer ${tokens.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: buildBody(options.body, headers),
  });

  if (
    response.status === 401 &&
    options.auth !== false &&
    options.retryOnUnauthorized !== false
  ) {
    const refreshed = await refreshTokens();

    if (refreshed) {
      return sendRequest<T>(path, { ...options, retryOnUnauthorized: false });
    }
  }

  const data = await parseBody(response);

  if (!response.ok) {
    throw toApiError(response, data);
  }

  return data as T;
}

function buildBody(body: unknown, headers: Headers): RequestInit["body"] {
  if (body === undefined) return undefined;

  if (body instanceof FormData) {
    return body;
  }

  headers.set("Content-Type", "application/json");
  return JSON.stringify(body);
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function toApiError(response: Response, data: unknown): ApiError {
  if (data && typeof data === "object") {
    const problem = data as {
      title?: string;
      detail?: string;
      errors?: Record<string, string[]>;
    };

    return new ApiError(
      response.status,
      problem.title || response.statusText,
      problem.detail,
      problem.errors,
    );
  }

  return new ApiError(response.status, response.statusText || "Request failed");
}

async function refreshTokens(): Promise<AuthTokens | null> {
  if (!refreshPromise) {
    refreshPromise = doRefreshTokens().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

async function doRefreshTokens(): Promise<AuthTokens | null> {
  const currentTokens = await getAuthTokens();

  if (!currentTokens?.refreshToken) {
    return null;
  }

  try {
    const response = await sendRequest<AuthResponse>("/api/auth/refresh", {
      method: "POST",
      auth: false,
      retryOnUnauthorized: false,
      body: {
        refreshToken: currentTokens.refreshToken,
      },
    });

    const newTokens: AuthTokens = {
      accessToken: response.accessToken,
      accessTokenExpiresAtUtc: response.accessTokenExpiresAtUtc,
      refreshToken: response.refreshToken,
      refreshTokenExpiresAtUtc: response.refreshTokenExpiresAtUtc,
    };

    await saveAuthTokens(newTokens);
    return newTokens;
  } catch {
    await clearAuthTokens();
    return null;
  }
}
