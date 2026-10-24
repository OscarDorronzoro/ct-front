// Code of a backend error body ({ error, code, ... }), if it has one
function codeOf(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'code' in data && typeof data.code === 'string') {
    return data.code;
  }
  return undefined;
}

export class ApiError extends Error {
  readonly status: number;

  readonly data: unknown;

  readonly code: string | undefined;

  constructor(message: string, status: number, data: unknown = null) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.code = codeOf(data);
  }
}
