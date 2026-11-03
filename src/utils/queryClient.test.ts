import { ApiError } from "./http";

// test/setup.ts swaps in zero retry delays; check the real configuration here.
const { createQueryClient, QUERY_RETRIES, shouldRetry } =
  jest.requireActual<typeof import("./queryClient")>("./queryClient");

describe("createQueryClient", () => {
  const { queries, mutations } = createQueryClient().getDefaultOptions();

  it("retries transient failures twice", () => {
    expect(QUERY_RETRIES).toBe(2);
    for (const error of [new ApiError(500, "Boom"), new ApiError(0, "Offline"), new Error("?")]) {
      expect(shouldRetry(0, error)).toBe(true);
      expect(shouldRetry(1, error)).toBe(true);
      expect(shouldRetry(2, error)).toBe(false);
    }
    expect(queries?.retry).toBe(shouldRetry);
  });

  it.each([400, 404, 422, 499])("does not retry a %i: the request itself was rejected", (status) => {
    expect(shouldRetry(0, new ApiError(status, "invalid serviceId"))).toBe(false);
  });

  it("backs off exponentially, capped at 4 seconds", () => {
    const retryDelay = queries?.retryDelay as (attempt: number) => number;

    expect([0, 1, 2, 3, 4].map(retryDelay)).toEqual([500, 1000, 2000, 4000, 4000]);
  });

  it("never retries mutations such as bookings", () => {
    expect(mutations?.retry).toBe(false);
  });

  it("accepts overrides for queries", () => {
    expect(createQueryClient({ staleTime: 0 }).getDefaultOptions().queries?.staleTime).toBe(0);
  });
});
