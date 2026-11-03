import { act, fireEvent, screen, waitFor } from "@testing-library/react-native";
import { KeyboardAvoidingView } from "react-native";
import { appointment, confirmation, hoursFromNow, NOW } from "../../../test/fixtures";
import { fetchCalls, mockFetch, serverError } from "../../../test/mockFetch";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { createQueryClient } from "@utils/queryClient";
import BookingPage from "./BookingPage";

const slot = appointment({ id: "appt-1", start: hoursFromNow(24) });
const BOOK = "PATCH /appointments/book/appt-1";

const renderPage = (appointmentId = "appt-1", serviceId = 1) => {
  const onBooked = jest.fn();
  const onChooseAnother = jest.fn();
  const utils = renderWithProviders(
    <BookingPage
      appointmentId={appointmentId}
      onBooked={onBooked}
      onChooseAnother={onChooseAnother}
      serviceId={serviceId}
    />,
  );
  return { onBooked, onChooseAnother, ...utils };
};

const fill = (values: Partial<Record<"Full name" | "Email" | "Year" | "Make" | "Model", string>>) => {
  for (const [label, value] of Object.entries(values)) {
    fireEvent.changeText(screen.getByLabelText(label), value);
  }
};

const fillValid = () =>
  fill({ "Full name": "  Jane Doe ", Email: "jane@example.com ", Year: "2005", Make: "Mazda", Model: "Miata" });

const submit = () => fireEvent.press(screen.getByRole("button", { name: "Book Appointment" }));

describe("BookingPage", () => {
  describe("loading the slot", () => {
    it("shows the selected slot once loaded", async () => {
      mockFetch({ "GET /appointments/1": { body: [slot] } });
      renderPage();

      expect(screen.getByText("Loading appointment…")).toBeOnTheScreen();
      expect(await screen.findByText("Synthetic Oil Change")).toBeOnTheScreen();
      expect(screen.getByText("Wednesday, November 4th 12:00 PM")).toBeOnTheScreen();
      expect(screen.getByText("30 min")).toBeOnTheScreen();
      expect(screen.getByRole("header", { name: "Your Details" })).toBeOnTheScreen();
    });

    it("offsets keyboard avoidance by the header above it", async () => {
      mockFetch({ "GET /appointments/1": { body: [slot] } });
      renderWithProviders(
        <BookingPage
          appointmentId="appt-1"
          keyboardOffset={96}
          onBooked={jest.fn()}
          onChooseAnother={jest.fn()}
          serviceId={1}
        />,
      );
      await screen.findByText("Synthetic Oil Change");

      expect(screen.UNSAFE_getByType(KeyboardAvoidingView).props.keyboardVerticalOffset).toBe(96);
    });

    it("keeps the form when a background re-check of a known slot fails", async () => {
      const fetchSpy = mockFetch({ "GET /appointments/1": serverError });
      const queryClient = createQueryClient();
      // Loaded by the services list over a minute ago, so it's stale and gets re-checked.
      queryClient.setQueryData(["appointments", "service", 1], [slot], { updatedAt: NOW.getTime() - 60_000 });
      renderWithProviders(
        <BookingPage appointmentId="appt-1" onBooked={jest.fn()} onChooseAnother={jest.fn()} serviceId={1} />,
        queryClient,
      );

      await waitFor(() => expect(fetchCalls(fetchSpy, "GET /appointments/1")).toHaveLength(3));
      await waitFor(() => expect(queryClient.getQueryState(["appointments", "service", 1])?.status).toBe("error"));
      expect(screen.getByText("Synthetic Oil Change")).toBeOnTheScreen();
      expect(screen.getByLabelText("Email")).toBeOnTheScreen();
      expect(screen.queryByRole("alert")).toBeNull();
    });

    it("recovers from a failed load with Try again", async () => {
      mockFetch({ "GET /appointments/1": [{ status: 503, body: "Down" }, { status: 503, body: "Down" }, { status: 503, body: "Down" }, { body: [slot] }] });
      renderPage();

      expect(await screen.findByRole("alert")).toHaveTextContent("Down");
      fireEvent.press(screen.getByRole("button", { name: "Try again" }));
      expect(await screen.findByText("Synthetic Oil Change")).toBeOnTheScreen();
    });

    it("looks the slot up through its service, never /appointments", async () => {
      const fetchSpy = mockFetch({ "GET /appointments/1": { body: [slot] } });
      renderPage();

      await screen.findByText("Synthetic Oil Change");
      expect(fetchCalls(fetchSpy, "GET /appointments/1")).toHaveLength(1);
      expect(fetchCalls(fetchSpy, "GET /appointments")).toHaveLength(0);
    });

    it.each(["not-a-number", "0"])("explains a link with an invalid service (%p) without fetching", async (raw) => {
      const fetchSpy = mockFetch({});
      const { onChooseAnother } = renderPage("appt-1", Number(raw));

      expect(await screen.findByText("This appointment is no longer available.")).toBeOnTheScreen();
      expect(fetchSpy).not.toHaveBeenCalled();
      fireEvent.press(screen.getByRole("button", { name: "Choose another time" }));
      expect(onChooseAnother).toHaveBeenCalledTimes(1);
    });

    it.each([
      ["no longer offered", [slot], "missing"],
      ["marked booked", [appointment({ id: "appt-1", booked: true })], "appt-1"],
      ["in the past", [appointment({ id: "appt-1", start: hoursFromNow(-1) })], "appt-1"],
    ])("explains when the slot is %s and offers another time", async (_case, appointments, id) => {
      mockFetch({ "GET /appointments/1": { body: appointments } });
      const { onChooseAnother } = renderPage(id);

      expect(await screen.findByText("This appointment is no longer available.")).toBeOnTheScreen();
      expect(screen.queryByLabelText("Email")).toBeNull();
      fireEvent.press(screen.getByRole("button", { name: "Choose another time" }));
      expect(onChooseAnother).toHaveBeenCalledTimes(1);
    });
  });

  describe("validation", () => {
    beforeEach(() => {
      mockFetch({ "GET /appointments/1": { body: [slot] } });
    });

    it("labels every field", async () => {
      renderPage();
      await screen.findByText("Synthetic Oil Change");

      for (const label of ["Full name", "Email", "Year", "Make", "Model"]) {
        expect(screen.getByLabelText(label)).toBeOnTheScreen();
      }
    });

    it("waits until a field loses focus before showing its error", async () => {
      renderPage();
      await screen.findByText("Synthetic Oil Change");
      fill({ Email: "jane" });

      expect(screen.queryByText(/valid email/)).toBeNull();
      fireEvent(screen.getByLabelText("Email"), "blur");
      expect(screen.getByText("Enter a valid email address, like name@example.com.")).toBeOnTheScreen();
    });

    it("updates a visible error as the user types", async () => {
      renderPage();
      await screen.findByText("Synthetic Oil Change");
      fill({ Year: "19" });
      fireEvent(screen.getByLabelText("Year"), "blur");
      expect(screen.getByText("Enter a 4-digit year.")).toBeOnTheScreen();

      fill({ Year: "1850" });
      expect(screen.getByText("Enter a year between 1900 and 2027.")).toBeOnTheScreen();

      fill({ Year: "1999" });
      expect(screen.queryByText(/Enter a/)).toBeNull();
    });

    it("shows every error on submit and sends nothing", async () => {
      const fetchSpy = mockFetch({ "GET /appointments/1": { body: [slot] } });
      renderPage();
      await screen.findByText("Synthetic Oil Change");

      submit();

      for (const message of [
        "Enter your name.",
        "Enter your email address.",
        "Enter your vehicle's year.",
        "Enter your vehicle's make.",
        "Enter your vehicle's model.",
      ]) {
        expect(screen.getByText(message)).toBeOnTheScreen();
      }
      expect(screen.getByLabelText("Email").props.accessibilityHint).toBe("Enter your email address.");
      expect(fetchCalls(fetchSpy, BOOK)).toHaveLength(0);
    });

    it("rejects whitespace-only answers", async () => {
      const fetchSpy = mockFetch({ "GET /appointments/1": { body: [slot] } });
      renderPage();
      await screen.findByText("Synthetic Oil Change");

      fill({ "Full name": "   ", Email: "jane@example.com", Year: "2005", Make: "Mazda", Model: "Miata" });
      submit();

      expect(screen.getByText("Enter your name.")).toBeOnTheScreen();
      expect(fetchCalls(fetchSpy, BOOK)).toHaveLength(0);
    });
  });

  describe("booking", () => {
    it("sends trimmed values with a numeric year and hands off the confirmation", async () => {
      const fetchSpy = mockFetch({ "GET /appointments/1": { body: [slot] }, [BOOK]: { body: confirmation() } });
      const { onBooked, queryClient } = renderPage();
      await screen.findByText("Synthetic Oil Change");

      fillValid();
      submit();

      await waitFor(() => expect(onBooked).toHaveBeenCalledWith("appt-1"));
      const [, init] = fetchCalls(fetchSpy, BOOK)[0];
      expect(JSON.parse(String((init as RequestInit).body))).toEqual({
        customerName: "Jane Doe",
        email: "jane@example.com",
        modelYear: 2005,
        make: "Mazda",
        model: "Miata",
      });
      expect(queryClient.getQueryData(["confirmation", "appt-1"])).toEqual(confirmation());
    });

    it("submits from the keyboard's done key on the last field", async () => {
      const fetchSpy = mockFetch({ "GET /appointments/1": { body: [slot] }, [BOOK]: { body: confirmation() } });
      const { onBooked } = renderPage();
      await screen.findByText("Synthetic Oil Change");

      fillValid();
      fireEvent(screen.getByLabelText("Model"), "submitEditing");

      await waitFor(() => expect(onBooked).toHaveBeenCalled());
      expect(fetchCalls(fetchSpy, BOOK)).toHaveLength(1);
    });

    it("disables the form while booking so it can't be sent twice", async () => {
      let respond: (value: { body: unknown }) => void = () => undefined;
      const fetchSpy = mockFetch({
        "GET /appointments/1": { body: [slot] },
        [BOOK]: () => new Promise((resolve) => (respond = resolve)),
      });
      const { onBooked } = renderPage();
      await screen.findByText("Synthetic Oil Change");

      fillValid();
      submit();

      const busy = await screen.findByRole("button", { name: "Booking…" });
      expect(busy).toBeDisabled();
      expect(screen.getByLabelText("Email")).toHaveProp("editable", false);
      fireEvent.press(busy);
      fireEvent(screen.getByLabelText("Model"), "submitEditing");
      expect(fetchCalls(fetchSpy, BOOK)).toHaveLength(1);

      await act(async () => respond({ body: confirmation() }));
      await waitFor(() => expect(onBooked).toHaveBeenCalledTimes(1));
      // Stays disabled during the hand-off to the confirmation screen.
      expect(screen.getByRole("button", { name: "Booking…" })).toBeDisabled();
    });

    it.each(["invalid email address", "invalid customer name", "invalid make/model/modelYear", "Invalid appointment id"])(
      "shows the server's %p rejection and no confirmation",
      async (message) => {
        mockFetch({ "GET /appointments/1": { body: [slot] }, [BOOK]: { status: 400, body: message } });
        const { onBooked, queryClient } = renderPage();
        await screen.findByText("Synthetic Oil Change");

        fillValid();
        submit();

        expect(await screen.findByRole("alert")).toHaveTextContent(message);
        expect(onBooked).not.toHaveBeenCalled();
        expect(queryClient.getQueryData(["confirmation", "appt-1"])).toBeUndefined();
        // The user can correct and resubmit.
        expect(screen.getByRole("button", { name: "Book Appointment" })).toBeEnabled();
      },
    );

    it("sends the user to pick another time when the slot was just taken", async () => {
      mockFetch({
        // The refresh triggered by the 400 no longer lists the slot.
        "GET /appointments/1": [{ body: [slot] }, { body: [] }],
        [BOOK]: { status: 400, body: "This appointment is already booked." },
      });
      const { onBooked, onChooseAnother } = renderPage();
      await screen.findByText("Synthetic Oil Change");

      fillValid();
      submit();

      expect(await screen.findByText("This appointment is already booked.")).toBeOnTheScreen();
      fireEvent.press(await screen.findByRole("button", { name: "Choose another time" }));
      expect(onChooseAnother).toHaveBeenCalledTimes(1);
      expect(onBooked).not.toHaveBeenCalled();
    });

    it("does not retry a server error and lets the user try again", async () => {
      const fetchSpy = mockFetch({
        "GET /appointments/1": { body: [slot] },
        [BOOK]: [{ status: 500, body: "Unexpected error" }, { body: confirmation() }],
      });
      const { onBooked } = renderPage();
      await screen.findByText("Synthetic Oil Change");

      fillValid();
      submit();

      expect(await screen.findByRole("alert")).toHaveTextContent("Unexpected error");
      expect(fetchCalls(fetchSpy, BOOK)).toHaveLength(1);
      expect(onBooked).not.toHaveBeenCalled();

      submit();
      await waitFor(() => expect(onBooked).toHaveBeenCalledWith("appt-1"));
      expect(fetchCalls(fetchSpy, BOOK)).toHaveLength(2);
    });

    it("explains a lost connection", async () => {
      mockFetch({ "GET /appointments/1": { body: [slot] }, [BOOK]: new TypeError("Network request failed") });
      const { onBooked } = renderPage();
      await screen.findByText("Synthetic Oil Change");

      fillValid();
      submit();

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "We couldn't reach the server. Check your connection and try again.",
      );
      expect(onBooked).not.toHaveBeenCalled();
    });
  });
});
