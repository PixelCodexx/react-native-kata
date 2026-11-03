import { fireEvent, render, screen } from "@testing-library/react-native";
import Notice from "./Notice";

describe("Notice", () => {
  it("announces its message", () => {
    render(<Notice message="Times may be out of date." />);

    expect(screen.getByRole("alert")).toHaveTextContent("Times may be out of date.");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("runs its action", () => {
    const onPress = jest.fn();
    render(<Notice action={{ label: "Try again", onPress }} message="Stale" tone="error" />);

    fireEvent.press(screen.getByRole("button", { name: "Try again" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("disables its action", () => {
    const onPress = jest.fn();
    render(<Notice action={{ label: "Retrying…", onPress, disabled: true }} message="Stale" />);

    const button = screen.getByRole("button", { name: "Retrying…" });
    expect(button).toBeDisabled();
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
