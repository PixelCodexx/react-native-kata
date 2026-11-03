import { router } from "expo-router";
import { act, fireEvent, renderRouter, screen, waitFor } from "expo-router/testing-library";
import type { Appointment, BookingRequest } from "@utils/types";
import { appointment, hoursFromNow, services } from "../../test/fixtures";
import { fetchCalls, mockFetch, serverError } from "../../test/mockFetch";

// Lives outside src/app on purpose: test files there would become routes.

let spy: jest.SpyInstance;

/**
 * In-memory stand-in for src/server. `failures` makes a service's slot
 * endpoint return that many 500s first.
 */
const fakeApi = (appointments: Appointment[], { failures = {} }: { failures?: Record<number, number> } = {}) => {
  const failuresLeft = { ...failures };
  const store = appointments.map((item) => ({ ...item }));

  const serviceSlots = (serviceId: number) => () => {
    if ((failuresLeft[serviceId] ?? 0) > 0) {
      failuresLeft[serviceId]--;
      return serverError;
    }
    return { body: store.filter((item) => item.serviceId === serviceId && !item.booked) };
  };

  const book = (id: string) => (init?: RequestInit) => {
    const target = store.find((item) => item.id === id);
    if (!target) return { status: 400, body: "Invalid appointment id" };
    if (target.booked) return { status: 400, body: "This appointment is already booked." };
    Object.assign(target, JSON.parse(String(init?.body)) as BookingRequest, { booked: true });
    const { serviceId: _serviceId, ...confirmation } = target;
    return { body: confirmation };
  };

  spy = mockFetch({
    "GET /services": { body: services },
    // Exposes other customers' details; the app must never call it.
    "GET /appointments": () => ({ body: store }),
    ...Object.fromEntries(services.map((service) => [`GET /appointments/${service.id}`, serviceSlots(service.id)])),
    ...Object.fromEntries(store.map((item) => [`PATCH /appointments/book/${item.id}`, book(item.id)])),
  });

  return { spy, store };
};

const oilSoon = appointment({ id: "oil-soon", serviceId: 1, start: hoursFromNow(24) });
const oilLater = appointment({ id: "oil-later", serviceId: 1, start: hoursFromNow(48) });
const tireSlot = appointment({ id: "tire-1", serviceId: 3, serviceName: "Tire Rotation & Inspection", duration: 3600 });

const renderApp = (initialUrl: string) => renderRouter("./src/app", { initialUrl });

const startBooking = async () => {
  const app = renderApp("/");
  fireEvent.press(screen.getByRole("button", { name: "Get Started" }));
  expect(app.getPathname()).toBe("/services");
  return app;
};

const chooseOilSlot = async (index: number) => {
  fireEvent.press(await screen.findByRole("button", { name: /^Synthetic Oil Change/ }));
  fireEvent.press((await screen.findAllByRole("radio"))[index]);
  fireEvent.press(screen.getByRole("button", { name: "Book Now" }));
};

const fillAndSubmit = async () => {
  await screen.findByLabelText("Full name");
  fireEvent.changeText(screen.getByLabelText("Full name"), "Jane Doe");
  fireEvent.changeText(screen.getByLabelText("Email"), "jane@example.com");
  fireEvent.changeText(screen.getByLabelText("Year"), "2005");
  fireEvent.changeText(screen.getByLabelText("Make"), "Mazda");
  fireEvent.changeText(screen.getByLabelText("Model"), "Miata");
  fireEvent.press(screen.getByRole("button", { name: "Book Appointment" }));
};

describe("booking journey", () => {
  afterEach(() => {
    expect(fetchCalls(spy, "GET /appointments")).toHaveLength(0);
  });

  it("books a slot from the landing page through to confirmation", async () => {
    const { store } = fakeApi([oilSoon, oilLater, tireSlot]);
    const app = await startBooking();

    await chooseOilSlot(1);
    expect(app.getPathname()).toBe("/book/oil-later");
    expect(await screen.findByText("Thursday, November 5th 12:00 PM")).toBeOnTheScreen();

    await fillAndSubmit();

    expect(await screen.findByRole("header", { name: "You're booked!" })).toBeOnTheScreen();
    expect(app.getPathname()).toBe("/confirmation/oil-later");
    expect(screen.getByText("2005 Mazda Miata")).toBeOnTheScreen();
    expect(store.find((item) => item.id === "oil-later")).toMatchObject({ booked: true, customerName: "Jane Doe" });
  });

  it("returns to an up-to-date services list after booking, without the form in history", async () => {
    fakeApi([oilSoon, oilLater, tireSlot]);
    const app = await startBooking();
    await chooseOilSlot(0);
    await fillAndSubmit();
    await screen.findByRole("header", { name: "You're booked!" });

    fireEvent.press(screen.getByRole("button", { name: "Book another service" }));

    expect(app.getPathname()).toBe("/services");
    expect(
      await screen.findByRole("button", { name: "Synthetic Oil Change, 30 minutes, 1 appointment available" }),
    ).toBeOnTheScreen();

    // Neither the form nor the confirmation is left in history.
    const stack = app.getRouterState()?.routes[0]?.state;
    expect(stack?.routes.map((route: { name: string }) => route.name)).toEqual(["index", "services/index"]);
  });

  it("keeps the user moving when one service's availability keeps failing", async () => {
    fakeApi([oilSoon, oilLater, tireSlot], { failures: { 1: 3 } });
    const app = await startBooking();

    // Oil change failed even after retries; tires are still bookable.
    expect(await screen.findByText("We couldn't check availability.")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: /^Tire Rotation/ })).toBeOnTheScreen();
    expect(fetchCalls(spy, "GET /appointments/1")).toHaveLength(3);

    fireEvent.press(screen.getByRole("button", { name: "Try again" }));
    fireEvent.press(await screen.findByRole("button", { name: /^Synthetic Oil Change/ }));
    fireEvent.press(screen.getAllByRole("radio")[0]);
    fireEvent.press(screen.getByRole("button", { name: "Book Now" }));
    expect(app.getPathname()).toBe("/book/oil-soon");
    await fillAndSubmit();

    expect(await screen.findByRole("header", { name: "You're booked!" })).toBeOnTheScreen();
  });

  it("recovers when someone else books the slot first", async () => {
    const { store } = fakeApi([oilSoon, oilLater]);
    const app = await startBooking();
    await chooseOilSlot(0);
    await screen.findByLabelText("Full name");

    // Another customer takes the slot while this one fills in the form.
    store.find((item) => item.id === "oil-soon")!.booked = true;
    await fillAndSubmit();

    expect(await screen.findByText("This appointment is already booked.")).toBeOnTheScreen();
    expect(screen.queryByText("You're booked!")).toBeNull();

    fireEvent.press(await screen.findByRole("button", { name: "Choose another time" }));
    expect(app.getPathname()).toBe("/services");

    // The taken slot is gone; book the remaining one.
    await waitFor(() => expect(screen.getAllByRole("radio")).toHaveLength(1));
    fireEvent.press(screen.getByRole("radio"));
    fireEvent.press(screen.getByRole("button", { name: "Book Now" }));
    await fillAndSubmit();

    expect(await screen.findByRole("header", { name: "You're booked!" })).toBeOnTheScreen();
    expect(app.getPathname()).toBe("/confirmation/oil-later");
  });

  it("handles opening a confirmation link with no booking", async () => {
    fakeApi([oilSoon]);
    const app = renderApp("/confirmation/unknown");

    expect(await screen.findByText("We couldn't find this booking's details.")).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "Start over" }));
    expect(app.getPathname()).toBe("/services");
  });

  it("sends 'Choose another time' to services even when the link opened over the landing page", async () => {
    fakeApi([oilSoon]);
    const app = renderApp("/");

    act(() => router.push("/book/unknown?serviceId=1"));
    fireEvent.press(await screen.findByRole("button", { name: "Choose another time" }));

    expect(app.getPathname()).toBe("/services");
  });

  it("handles opening a booking link for a slot that doesn't exist", async () => {
    fakeApi([oilSoon]);
    const app = renderApp("/book/unknown");

    expect(await screen.findByText("This appointment is no longer available.")).toBeOnTheScreen();
    fireEvent.press(screen.getByRole("button", { name: "Choose another time" }));
    expect(app.getPathname()).toBe("/services");
  });
});
