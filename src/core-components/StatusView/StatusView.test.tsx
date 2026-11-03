import { fireEvent, render, screen } from "@testing-library/react-native";
import StatusView from "./StatusView";

describe("StatusView", () => {
  it("shows a loading message with a spinner", () => {
    render(<StatusView loading message="Loading services…" />);

    expect(screen.getByText("Loading services…")).toBeOnTheScreen();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("announces errors and retries on press", () => {
    const onRetry = jest.fn();
    render(<StatusView message="Server down" onRetry={onRetry} tone="error" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Server down");
    fireEvent.press(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("uses a custom action label", () => {
    render(<StatusView message="Gone" onRetry={jest.fn()} retryLabel="Choose another time" />);

    expect(screen.getByRole("button", { name: "Choose another time" })).toBeOnTheScreen();
  });

  it("disables the action while retrying", () => {
    const onRetry = jest.fn();
    render(<StatusView message="Server down" onRetry={onRetry} retrying tone="error" />);

    const button = screen.getByRole("button", { name: "Retrying…" });
    expect(button).toBeDisabled();
    fireEvent.press(button);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it("is not an alert for neutral messages", () => {
    render(<StatusView message="Nothing here" />);

    expect(screen.queryByRole("alert")).toBeNull();
  });
});
