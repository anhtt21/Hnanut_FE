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

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const firstValidationError = Object.values(error.errors ?? {})[0]?.[0];
    return firstValidationError || error.detail || error.title;
  }
  if (error instanceof TypeError) {
    return "Không kết nối được server API. Hãy kiểm tra backend đã chạy và API base URL.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Có lỗi xảy ra. Vui lòng thử lại.";
}
