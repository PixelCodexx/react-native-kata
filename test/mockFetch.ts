export type MockReply = { status?: number; body?: unknown } | Error;
export type RouteHandler = MockReply | MockReply[] | ((init?: RequestInit) => MockReply | Promise<MockReply>);

const toResponse = ({ status = 200, body }: { status?: number; body?: unknown }) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    // Round-trip like a real response, so callers never share objects with the mock.
    json: async () => JSON.parse(typeof body === "string" ? body : JSON.stringify(body)),
    text: async () => (typeof body === "string" ? body : JSON.stringify(body ?? "")),
  }) as Response;

/**
 * Replaces `fetch` with canned replies keyed by "METHOD /path" (the API base
 * URL is stripped). An array is used in order and its last reply repeats.
 * An `Error` reply simulates a network failure. Unmatched routes fail loudly.
 */
export const mockFetch = (routes: Record<string, RouteHandler>) => {
  const queues = new Map<string, MockReply[]>();

  return jest.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = new URL(String(input));
    const key = `${init?.method ?? "GET"} ${url.pathname}`;
    const handler = routes[key];
    if (handler === undefined) throw new Error(`Unexpected request: ${key}`);

    let reply: MockReply;
    if (typeof handler === "function") {
      reply = await handler(init);
    } else if (Array.isArray(handler)) {
      const queue = queues.get(key) ?? [...handler];
      reply = queue.length > 1 ? queue.shift()! : queue[0];
      queues.set(key, queue);
    } else {
      reply = handler;
    }

    if (reply instanceof Error) throw reply;
    return toResponse(reply);
  });
};

export const fetchCalls = (spy: jest.SpyInstance, key: string) =>
  spy.mock.calls.filter(([input, init]) => {
    const url = new URL(String(input));
    return `${(init as RequestInit | undefined)?.method ?? "GET"} ${url.pathname}` === key;
  });

export const serverError = { status: 500, body: "Unable to load appointments. Please try again." };
