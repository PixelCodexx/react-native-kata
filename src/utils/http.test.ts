import { mockFetch } from "../../test/mockFetch";
import {
  ApiError,
  BAD_RESPONSE_MESSAGE,
  getErrorMessage,
  NETWORK_ERROR_MESSAGE,
  request,
  TIMEOUT_ERROR_MESSAGE,
} from "./http";

describe("request", () => {
  it("prefixes the configured base URL and decodes JSON on success", async () => {
    const fetchSpy = mockFetch({ "GET /services": { body: [{ id: 1 }] } });

    await expect(request("/services")).resolves.toEqual([{ id: 1 }]);
    expect(fetchSpy).toHaveBeenCalledWith("http://api.test/services", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it("passes request options through", async () => {
    const fetchSpy = mockFetch({ "PATCH /thing": { body: {} } });
    const init = { method: "PATCH", body: "{}" };

    await request("/thing", init);
    expect(fetchSpy).toHaveBeenCalledWith("http://api.test/thing", expect.objectContaining(init));
  });

  it("turns a non-2xx plain-text body into an ApiError without decoding JSON", async () => {
    mockFetch({ "GET /appointments/1": { status: 500, body: "Unable to load appointments. Please try again." } });

    const error = await request("/appointments/1").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 500, message: "Unable to load appointments. Please try again." });
  });

  it("keeps 400 validation messages from the server", async () => {
    mockFetch({ "PATCH /appointments/book/x": { status: 400, body: "This appointment is already booked." } });

    await expect(request("/appointments/book/x", { method: "PATCH" })).rejects.toMatchObject({
      status: 400,
      message: "This appointment is already booked.",
    });
  });

  it("uses a generic message when the error body is empty", async () => {
    mockFetch({ "GET /services": { status: 503, body: "   " } });

    await expect(request("/services")).rejects.toMatchObject({
      status: 503,
      message: "Something went wrong. Please try again.",
    });
  });

  it("reports network failures as status 0 with a friendly message", async () => {
    mockFetch({ "GET /services": new TypeError("Network request failed") });

    await expect(request("/services")).rejects.toMatchObject({ status: 0, message: NETWORK_ERROR_MESSAGE });
  });

  it("gives up on a server that never answers", async () => {
    mockFetch({
      "GET /services": (init) =>
        new Promise((_, reject) => init?.signal?.addEventListener("abort", () => reject(new Error("aborted")))),
    });

    await expect(request("/services", undefined, { timeoutMs: 10 })).rejects.toMatchObject({
      status: 0,
      message: TIMEOUT_ERROR_MESSAGE,
    });
  });

  it("does not time out a response that arrives in time", async () => {
    mockFetch({ "GET /services": async () => ({ body: [] }) });

    await expect(request("/services", undefined, { timeoutMs: 1000 })).resolves.toEqual([]);
  });

  it("reports a malformed success body without leaking a parser error", async () => {
    mockFetch({ "GET /services": { body: "<html>not json</html>" } });

    await expect(request("/services")).rejects.toMatchObject({ status: 200, message: BAD_RESPONSE_MESSAGE });
  });

  it("surfaces missing API configuration before sending anything", async () => {
    const fetchSpy = mockFetch({});
    delete process.env.EXPO_PUBLIC_API_URL;

    await expect(request("/services")).rejects.toThrow("EXPO_PUBLIC_API_URL");
    expect(fetchSpy).not.toHaveBeenCalled();
    process.env.EXPO_PUBLIC_API_URL = "http://api.test";
  });
});

describe("getErrorMessage", () => {
  it("returns an error's message", () => {
    expect(getErrorMessage(new ApiError(500, "Nope"))).toBe("Nope");
  });

  it.each([undefined, null, "string", new Error("")])("falls back for %p", (value) => {
    expect(getErrorMessage(value)).toBe("Something went wrong. Please try again.");
  });
});
