type ApiErrorLanguage = "vi" | "en";

const localMessages = {
  vi: {
    network:
      "Không kết nối được server API. Hãy kiểm tra backend đã chạy và API base URL.",
    fallback: "Có lỗi xảy ra. Vui lòng thử lại.",
  },
  en: {
    network:
      "Could not connect to the API server. Please check that the backend is running and the API base URL is correct.",
    fallback: "Something went wrong. Please try again.",
  },
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly title: string,
    public readonly detail?: string,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(detail || title);
  }
}

export function getApiErrorMessage(
  error: unknown,
  language: ApiErrorLanguage = "vi",
): string {
  const messages = localMessages[language];

  if (error instanceof ApiError) {
    const firstValidationError = Object.values(error.errors ?? {})[0]?.[0];
    return firstValidationError || error.detail || error.title;
  }

  if (error instanceof TypeError) {
    return messages.network;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return messages.fallback;
}
