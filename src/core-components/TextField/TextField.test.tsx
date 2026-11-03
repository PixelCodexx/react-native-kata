import { fireEvent, render, screen } from "@testing-library/react-native";
import { createRef } from "react";
import type { TextInput } from "react-native";
import TextField from "./TextField";

describe("TextField", () => {
  it("labels the input and reports typing", () => {
    const onChangeText = jest.fn();
    render(<TextField label="Email" onChangeText={onChangeText} value="" />);

    fireEvent.changeText(screen.getByLabelText("Email"), "jane@example.com");
    expect(onChangeText).toHaveBeenCalledWith("jane@example.com");
  });

  it("shows no error by default", () => {
    render(<TextField error={undefined} label="Email" value="" />);

    expect(screen.queryByText(/enter/i)).toBeNull();
    expect(screen.getByLabelText("Email").props.accessibilityHint).toBeUndefined();
  });

  it("shows an error and exposes it to screen readers", () => {
    render(<TextField error="Enter your email address." label="Email" value="" />);

    expect(screen.getByText("Enter your email address.")).toBeOnTheScreen();
    expect(screen.getByLabelText("Email").props.accessibilityHint).toBe("Enter your email address.");
  });

  it("forwards its ref to the input", () => {
    const ref = createRef<TextInput>();
    render(<TextField label="Email" ref={ref} value="" />);

    expect(ref.current).not.toBeNull();
  });
});
