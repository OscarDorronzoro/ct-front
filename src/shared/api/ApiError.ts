const CODE = /^[A-Z][A-Z0-9_]*$/;

// Code of an error body: `code` of the client errors (NETWORK_ERROR...) or `error` of the
// backend ones (COW_NOT_FOUND...). The old "X not found" messages of some routes aren't codes.
export function errorCode(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') {
    return undefined;
  }
  if ('code' in data && typeof data.code === 'string') {
    return data.code;
  }
  if ('error' in data && typeof data.error === 'string' && CODE.test(data.error)) {
    return data.error;
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
    this.code = errorCode(data);
  }
}
