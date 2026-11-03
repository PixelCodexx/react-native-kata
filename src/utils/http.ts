import { getApiBaseUrl } from "./api";

export const NETWORK_ERROR_MESSAGE =
  "We couldn't reach the server. Check your connection and try again.";
export const TIMEOUT_ERROR_MESSAGE = "The server took too long to respond. Please try again.";
export const BAD_RESPONSE_MESSAGE = "We got an unexpected response from the server. Please try again.";
const FALLBACK_ERROR_MESSAGE = "Something went wrong. Please try again.";

// A wrong LAN IP on a phone can otherwise leave fetch hanging for a minute.
export const REQUEST_TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  /** HTTP status, or 0 when no response was received. */
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Fetches `path` from the configured API. Error bodies are plain text, so the
 * status is checked before any JSON decoding.
 */
export const request = async <T>(
  path: string,
  init?: RequestInit,
  { timeoutMs = REQUEST_TIMEOUT_MS } = {},
): Promise<T> => {
  const url = `${getApiBaseUrl()}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    let response: Response;
    try {
      response = await fetch(url, { ...init, signal: controller.signal });
    } catch {
      throw new ApiError(0, controller.signal.aborted ? TIMEOUT_ERROR_MESSAGE : NETWORK_ERROR_MESSAGE);
    }

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new ApiError(response.status, body.trim() || FALLBACK_ERROR_MESSAGE);
    }

    try {
      return (await response.json()) as T;
    } catch {
      throw new ApiError(response.status, BAD_RESPONSE_MESSAGE);
    }
  } finally {
    clearTimeout(timeout);
  }
};

export const getErrorMessage = (error: unknown): string =>
  error instanceof Error && error.message ? error.message : FALLBACK_ERROR_MESSAGE;
