import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import type { ReactNode } from "react";
import { appointment, confirmation, hoursFromNow, services } from "../../test/fixtures";
import { fetchCalls, mockFetch, serverError, type RouteHandler } from "../../test/mockFetch";
import { ApiError } from "./http";
import { createQueryClient } from "./queryClient";
import {
  isAlreadyBookedError,
  queryKeys,
  useAppointment,
  useBookAppointment,
  useServiceAvailability,
} from "./queries";

const renderWithClient = <T,>(hook: () => T) => {
  const queryClient = createQueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, ...renderHook(hook, { wrapper }) };
};

const oilLater = appointment({ id: "oil-later", serviceId: 1, start: hoursFromNow(5) });
const oilSoon = appointment({ id: "oil-soon", serviceId: 1, start: hoursFromNow(2) });
const tireSlot = appointment({ id: "tire-1", serviceId: 3, serviceName: "Tire Rotation & Inspection" });

/** Every service endpoint answers; override per test. */
const routes = (overrides: Record<string, RouteHandler> = {}): Record<string, RouteHandler> => ({
  "GET /services": { body: services },
  "GET /appointments/1": { body: [oilLater, oilSoon] },
  "GET /appointments/2": { body: [] },
  "GET /appointments/3": { body: [tireSlot] },
  "GET /appointments/4": { body: [appointment({ id: "detail-past", serviceId: 4, start: hoursFromNow(-1) })] },
  ...overrides,
});

describe("useServiceAvailability", () => {
  it("checks every service and keeps only those with bookable slots, sorted", async () => {
    mockFetch(routes());

    const { result } = renderWithClient(useServiceAvailability);
    expect(result.current.status).toBe("loading");

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items.map(({ service, slots, failed }) => [service.id, slots.map((s) => s.id), failed])).toEqual([
      [1, ["oil-soon", "oil-later"], false],
      [3, ["tire-1"], false],
    ]);
    expect(result.current.error).toBeNull();
    expect(result.current.refreshError).toBeNull();
  });

  it("never requests /appointments, which exposes other customers' details", async () => {
    const fetchSpy = mockFetch(routes());

    const { result } = renderWithClient(useServiceAvailability);
    await waitFor(() => expect(result.current.status).toBe("success"));

    expect(fetchCalls(fetchSpy, "GET /appointments")).toHaveLength(0);
  });

  it("absorbs a transient 500 with automatic retries", async () => {
    const fetchSpy = mockFetch(routes({ "GET /appointments/1": [serverError, serverError, { body: [oilSoon] }] }));

    const { result } = renderWithClient(useServiceAvailability);

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items[0]).toMatchObject({ failed: false, slots: [oilSoon] });
    expect(fetchCalls(fetchSpy, "GET /appointments/1")).toHaveLength(3);
  });

  it("keeps a service that still fails, marked failed, and retries only that one", async () => {
    const fetchSpy = mockFetch(
      routes({ "GET /appointments/1": [serverError, serverError, serverError, { body: [oilSoon] }] }),
    );

    const { result } = renderWithClient(useServiceAvailability);
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items.map(({ service, failed }) => [service.id, failed])).toEqual([
      [1, true],
      [3, false],
    ]);

    act(() => result.current.retryFailed());

    await waitFor(() => expect(result.current.items[0]).toMatchObject({ failed: false, slots: [oilSoon] }));
    expect(fetchCalls(fetchSpy, "GET /appointments/1")).toHaveLength(4);
    expect(fetchCalls(fetchSpy, "GET /appointments/3")).toHaveLength(1);
  });

  it("reports an error when every service fails", async () => {
    mockFetch(
      routes(Object.fromEntries(services.map((service) => [`GET /appointments/${service.id}`, serverError]))),
    );

    const { result } = renderWithClient(useServiceAvailability);

    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error?.message).toBe("Unable to load appointments. Please try again.");
  });

  it("reports an error when the services list fails, and recovers on retry", async () => {
    const fetchSpy = mockFetch(
      routes({ "GET /services": [serverError, serverError, serverError, { body: services }] }),
    );

    const { result } = renderWithClient(useServiceAvailability);
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(fetchCalls(fetchSpy, "GET /services")).toHaveLength(3);

    act(() => result.current.retryFailed());

    await waitFor(() => expect(result.current.status).toBe("success"));
  });

  it("does not retry a 4xx", async () => {
    const fetchSpy = mockFetch(routes({ "GET /appointments/1": { status: 400, body: "invalid serviceId" } }));

    const { result } = renderWithClient(useServiceAvailability);

    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items[0]).toMatchObject({ failed: true });
    expect(fetchCalls(fetchSpy, "GET /appointments/1")).toHaveLength(1);
  });

  it("keeps showing the last good data when a refresh fails, and says so", async () => {
    let up = true;
    mockFetch(
      routes({ "GET /appointments/1": () => (up ? { body: [oilSoon] } : serverError) }),
    );
    const { result, queryClient } = renderWithClient(useServiceAvailability);
    await waitFor(() => expect(result.current.status).toBe("success"));

    up = false;
    await act(() => queryClient.refetchQueries({ queryKey: queryKeys.serviceSlots(1) }));

    await waitFor(() => expect(result.current.refreshError).not.toBeNull());
    expect(result.current.status).toBe("success");
    expect(result.current.items[0]).toMatchObject({ failed: false, slots: [oilSoon] });
  });
});

describe("useAppointment", () => {
  it("finds a bookable appointment through its service's endpoint", async () => {
    const fetchSpy = mockFetch({ "GET /appointments/3": { body: [tireSlot] } });

    const { result } = renderWithClient(() => useAppointment(3, "tire-1"));

    await waitFor(() => expect(result.current.data).toEqual(tireSlot));
    expect(fetchCalls(fetchSpy, "GET /appointments")).toHaveLength(0);
  });

  it("returns null when the service no longer offers it", async () => {
    mockFetch({ "GET /appointments/1": { body: [oilSoon] } });

    const { result } = renderWithClient(() => useAppointment(1, "gone"));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
  });

  it.each([Number.NaN, 0, -1, 1.5])("does not fetch for an invalid service id (%p)", (serviceId) => {
    const fetchSpy = mockFetch({});

    const { result } = renderWithClient(() => useAppointment(serviceId, "x"));

    expect(result.current.fetchStatus).toBe("idle");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe("useBookAppointment", () => {
  const body = { email: "jane@example.com", customerName: "Jane Doe", modelYear: 2005, make: "Mazda", model: "Miata" };

  it("caches the confirmation and refreshes availability on success", async () => {
    mockFetch({ "PATCH /appointments/book/appt-1": { body: confirmation() } });
    const { result, queryClient } = renderWithClient(useBookAppointment);
    queryClient.setQueryData(queryKeys.serviceSlots(1), [oilSoon]);

    await act(() => result.current.mutateAsync({ id: "appt-1", body }));

    expect(queryClient.getQueryData(queryKeys.confirmation("appt-1"))).toEqual(confirmation());
    expect(queryClient.getQueryState(queryKeys.serviceSlots(1))?.isInvalidated).toBe(true);
  });

  it("never retries a failed booking", async () => {
    const fetchSpy = mockFetch({ "PATCH /appointments/book/appt-1": { status: 500, body: "Boom" } });
    const { result } = renderWithClient(useBookAppointment);

    await act(() => result.current.mutateAsync({ id: "appt-1", body }).catch(() => undefined));

    await waitFor(() => expect(result.current.error).toMatchObject({ status: 500, message: "Boom" }));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("refreshes availability after a 400 and caches no confirmation", async () => {
    mockFetch({ "PATCH /appointments/book/appt-1": { status: 400, body: "This appointment is already booked." } });
    const { result, queryClient } = renderWithClient(useBookAppointment);
    queryClient.setQueryData(queryKeys.serviceSlots(1), [oilSoon]);

    await act(() => result.current.mutateAsync({ id: "appt-1", body }).catch(() => undefined));

    expect(queryClient.getQueryState(queryKeys.serviceSlots(1))?.isInvalidated).toBe(true);
    expect(queryClient.getQueryData(queryKeys.confirmation("appt-1"))).toBeUndefined();
  });
});

describe("isAlreadyBookedError", () => {
  it.each([
    [new ApiError(400, "This appointment is already booked."), true],
    [new ApiError(400, "invalid email address"), false],
    [new ApiError(500, "already booked"), false],
    [new Error("This appointment is already booked."), false],
  ])("%p -> %p", (error, expected) => {
    expect(isAlreadyBookedError(error)).toBe(expected);
  });
});
