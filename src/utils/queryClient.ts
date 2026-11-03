import { QueryClient, type QueryObserverOptions } from "@tanstack/react-query";
import { ApiError } from "./http";

export const QUERY_RETRIES = 2;

/** 500ms, 1s, ... capped at 4s. */
const retryDelay = (attempt: number) => Math.min(500 * 2 ** attempt, 4000);

/**
 * Retry transient failures (5xx, network, timeout) but not 4xx: the server
 * has rejected the request itself, so sending it again won't help.
 */
export const shouldRetry = (failureCount: number, error: unknown) =>
  failureCount < QUERY_RETRIES && !(error instanceof ApiError && error.status >= 400 && error.status < 500);

export const createQueryClient = (queryDefaults: Partial<QueryObserverOptions> = {}) =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: shouldRetry,
        retryDelay,
        staleTime: 30_000,
        ...queryDefaults,
      },
      // Never resend a booking automatically: the user decides.
      mutations: { retry: false },
    },
  });
