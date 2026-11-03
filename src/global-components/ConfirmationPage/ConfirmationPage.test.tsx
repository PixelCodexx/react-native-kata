import { fireEvent, screen } from "@testing-library/react-native";
import { createQueryClient } from "@utils/queryClient";
import { confirmation } from "../../../test/fixtures";
import { renderWithProviders } from "../../../test/renderWithProviders";
import ConfirmationPage from "./ConfirmationPage";

const renderPage = (cached = confirmation()) => {
  const queryClient = createQueryClient();
  if (cached) queryClient.setQueryData(["confirmation", cached.id], cached);
  const onBookAnother = jest.fn();
  renderWithProviders(<ConfirmationPage appointmentId="appt-1" onBookAnother={onBookAnother} />, queryClient);
  return { onBookAnother, queryClient };
};

describe("ConfirmationPage", () => {
  it("shows the details the API returned", () => {
    renderPage(confirmation({ modelYear: "1999", make: "Honda", model: "Civic", customerName: "Sam Lee" }));

    expect(screen.getByRole("header", { name: "You're booked!" })).toBeOnTheScreen();
    for (const text of [
      "Synthetic Oil Change",
      "Wednesday, November 4th 12:00 PM",
      "30 min",
      "Sam Lee",
      "jane@example.com",
      "1999 Honda Civic",
      "appt-1",
    ]) {
      expect(screen.getByText(text)).toBeOnTheScreen();
    }
  });

  it("starts another booking", () => {
    const { onBookAnother } = renderPage();

    fireEvent.press(screen.getByRole("button", { name: "Book another service" }));
    expect(onBookAnother).toHaveBeenCalledTimes(1);
  });

  it("keeps showing the details if the cache entry is later removed", () => {
    const { queryClient } = renderPage();

    queryClient.clear();

    expect(screen.getByText("Jane Doe")).toBeOnTheScreen();
  });

  it("never invents a confirmation when there is no booking data", () => {
    const { onBookAnother } = renderPage(null as never);

    expect(screen.getByText("We couldn't find this booking's details.")).toBeOnTheScreen();
    expect(screen.queryByText("You're booked!")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Start over" }));
    expect(onBookAnother).toHaveBeenCalledTimes(1);
  });
});
