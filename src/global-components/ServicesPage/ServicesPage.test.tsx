import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { RefreshControl } from "react-native";
import { appointment, hoursFromNow, services } from "../../../test/fixtures";
import { fetchCalls, mockFetch, serverError, type RouteHandler } from "../../../test/mockFetch";
import { renderWithProviders } from "../../../test/renderWithProviders";
import ServicesPage from "./ServicesPage";

const oilLater = appointment({ id: "oil-later", serviceId: 1, start: hoursFromNow(48) });
const oilSoon = appointment({ id: "oil-soon", serviceId: 1, start: hoursFromNow(24) });
const tireSlot = appointment({
  id: "tire-1",
  serviceId: 3,
  serviceName: "Tire Rotation & Inspection",
  duration: 3600,
  start: hoursFromNow(30),
});

const routes = (overrides: Record<string, RouteHandler> = {}): Record<string, RouteHandler> => ({
  "GET /services": { body: services },
  "GET /appointments/1": { body: [oilLater, oilSoon] },
  "GET /appointments/2": { body: [] },
  "GET /appointments/3": { body: [tireSlot] },
  "GET /appointments/4": { body: [appointment({ id: "detail-past", serviceId: 4, start: hoursFromNow(-3) })] },
  ...overrides,
});

const OIL_CARD = /^Synthetic Oil Change, 30 minutes/;

const renderPage = (onBook = jest.fn()) => ({ onBook, ...renderWithProviders(<ServicesPage onBook={onBook} />) });
const pullToRefresh = () => act(() => screen.UNSAFE_getByType(RefreshControl).props.onRefresh());

describe("ServicesPage", () => {
  // FlatList renders extra cells on a ~50ms timer; let that finish inside act()
  // so it can't land after a test ends on a busy machine.
  afterEach(() => act(() => new Promise((resolve) => setTimeout(resolve, 60))));

  it("shows a loading state first", async () => {
    mockFetch(routes());
    renderPage();

    expect(screen.getByText("Loading services…")).toBeOnTheScreen();
    await screen.findByText("Synthetic Oil Change");
  });

  it("lists only services with bookable slots in the next two weeks", async () => {
    mockFetch(routes());
    renderPage();

    expect(
      await screen.findByRole("button", { name: "Synthetic Oil Change, 30 minutes, 2 appointments available" }),
    ).toBeOnTheScreen();
    expect(screen.getByRole("header", { name: "Select a Service" })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Tire Rotation & Inspection, 1 hour, 1 appointment available" })).toBeOnTheScreen();
    // No slots at all, and only a past slot.
    expect(screen.queryByText("Brake Inspection")).toBeNull();
    expect(screen.queryByText("Express Auto Detailing")).toBeNull();
  });

  it("never requests /appointments", async () => {
    const fetchSpy = mockFetch(routes());
    renderPage();
    await screen.findByText("Synthetic Oil Change");

    expect(fetchCalls(fetchSpy, "GET /appointments")).toHaveLength(0);
  });

  it("shows an empty state when nothing is bookable", async () => {
    mockFetch(routes({ "GET /appointments/1": { body: [] }, "GET /appointments/3": { body: [] } }));
    renderPage();

    expect(
      await screen.findByText("No appointments are available in the next two weeks. Please check back later."),
    ).toBeOnTheScreen();
  });

  it("keeps a service whose availability check failed, with its own Try again", async () => {
    const fetchSpy = mockFetch(
      routes({ "GET /appointments/3": [serverError, serverError, serverError, { body: [tireSlot] }] }),
    );
    renderPage();

    expect(await screen.findByText("We couldn't check availability.")).toBeOnTheScreen();
    expect(screen.getByText("Tire Rotation & Inspection")).toBeOnTheScreen();
    // The rest of the list is still usable.
    expect(screen.getByRole("button", { name: OIL_CARD })).toBeEnabled();

    fireEvent.press(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("button", { name: "Tire Rotation & Inspection, 1 hour, 1 appointment available" }),
    ).toBeOnTheScreen();
    expect(screen.queryByText("We couldn't check availability.")).toBeNull();
    // Only the failed service was asked again.
    expect(fetchCalls(fetchSpy, "GET /appointments/1")).toHaveLength(1);
    expect(fetchCalls(fetchSpy, "GET /appointments/3")).toHaveLength(4);
  });

  it("shows the server's error when everything fails, and recovers with Try again", async () => {
    const fetchSpy = mockFetch(routes({ "GET /services": [serverError, serverError, serverError, { body: services }] }));
    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to load appointments. Please try again.");
    expect(fetchCalls(fetchSpy, "GET /services")).toHaveLength(3);

    fireEvent.press(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByText("Synthetic Oil Change")).toBeOnTheScreen();
  });

  it("shows a connection error when the API is unreachable", async () => {
    mockFetch(routes({ "GET /services": new TypeError("Network request failed") }));
    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't reach the server. Check your connection and try again.",
    );
  });

  it("refreshes every service on pull-to-refresh", async () => {
    const fetchSpy = mockFetch(routes());
    renderPage();
    await screen.findByText("Synthetic Oil Change");

    await pullToRefresh();

    expect(fetchCalls(fetchSpy, "GET /services")).toHaveLength(2);
    for (const service of services) {
      expect(fetchCalls(fetchSpy, `GET /appointments/${service.id}`)).toHaveLength(2);
    }
  });

  it("keeps the last list on screen when a refresh fails, and recovers", async () => {
    let up = true;
    const fail = () => (up ? undefined : new TypeError("Network request failed"));
    mockFetch(
      routes({
        "GET /services": () => fail() ?? { body: services },
        "GET /appointments/1": () => fail() ?? { body: [oilSoon] },
      }),
    );
    renderPage();
    await screen.findByText("Synthetic Oil Change");

    up = false;
    await pullToRefresh();

    expect(await screen.findByRole("alert")).toHaveTextContent(/^We couldn't reach the server/);
    expect(screen.getByText("Synthetic Oil Change")).toBeOnTheScreen();

    up = true;
    fireEvent.press(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(screen.getByText("Synthetic Oil Change")).toBeOnTheScreen();
  });

  describe("expanding a service", () => {
    const expandOil = async () => fireEvent.press(await screen.findByRole("button", { name: OIL_CARD }));

    it("shows slots sorted by time and books the selected one, without another request", async () => {
      const fetchSpy = mockFetch(routes());
      const { onBook } = renderPage();
      await expandOil();

      expect(screen.getByRole("button", { name: OIL_CARD })).toBeExpanded();
      expect(screen.getByText("Available Appointments")).toBeOnTheScreen();
      expect(screen.getAllByRole("radio").map((radio) => radio.props.accessibilityLabel)).toEqual([
        "Wednesday, November 4th 12:00 PM, 30 minutes",
        "Thursday, November 5th 12:00 PM, 30 minutes",
      ]);
      expect(fetchCalls(fetchSpy, "GET /appointments/1")).toHaveLength(1);

      expect(screen.getByRole("button", { name: "Book Now" })).toBeDisabled();
      fireEvent.press(screen.getAllByRole("radio")[1]);
      expect(screen.getAllByRole("radio")[1]).toBeChecked();
      expect(screen.getAllByRole("radio")[0]).not.toBeChecked();

      fireEvent.press(screen.getByRole("button", { name: "Book Now" }));
      expect(onBook).toHaveBeenCalledWith(oilLater);
    });

    it("keeps one card open at a time and collapses on second tap", async () => {
      mockFetch(routes());
      renderPage();
      await expandOil();

      fireEvent.press(screen.getByRole("button", { name: /^Tire Rotation/ }));
      expect(screen.getByRole("button", { name: OIL_CARD })).toBeCollapsed();
      expect(screen.getByRole("radio")).toHaveProp("accessibilityLabel", "Wednesday, November 4th 06:00 PM, 1 hour");

      fireEvent.press(screen.getByRole("button", { name: /^Tire Rotation/ }));
      expect(screen.queryByText("Available Appointments")).toBeNull();
    });

    it("drops a selection whose slot disappears after a refresh", async () => {
      mockFetch(routes({ "GET /appointments/1": [{ body: [oilSoon, oilLater] }, { body: [oilLater] }] }));
      renderPage();
      await expandOil();

      fireEvent.press(screen.getAllByRole("radio")[0]);
      expect(screen.getByRole("button", { name: "Book Now" })).toBeEnabled();

      await pullToRefresh();

      await waitFor(() => expect(screen.getAllByRole("radio")).toHaveLength(1));
      expect(screen.getByRole("button", { name: "Book Now" })).toBeDisabled();
    });
  });
});
