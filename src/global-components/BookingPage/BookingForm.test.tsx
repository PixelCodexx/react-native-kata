import { fireEvent, render, screen } from "@testing-library/react-native";
import { TextInput } from "react-native";
import BookingForm from "./BookingForm";

// The Jest TextInput mock shares one `focus` mock across instances; the call
// context tells us which field was focused.
const focusMock = TextInput.prototype.focus as jest.Mock;
const lastFocused = () => {
  const contexts = focusMock.mock.contexts as { props: { accessibilityLabel?: string } }[];
  return contexts.at(-1)?.props.accessibilityLabel;
};

const renderForm = (props: Partial<Parameters<typeof BookingForm>[0]> = {}) => {
  const onSubmit = jest.fn();
  render(<BookingForm onSubmit={onSubmit} submitting={false} {...props} />);
  return { onSubmit };
};

beforeEach(() => focusMock.mockClear());

describe("BookingForm", () => {
  it("moves through the fields with the keyboard's next key", () => {
    renderForm();

    for (const [from, to] of [
      ["Full name", "Email"],
      ["Email", "Year"],
      ["Year", "Make"],
      ["Make", "Model"],
    ]) {
      fireEvent(screen.getByLabelText(from), "submitEditing");
      expect(lastFocused()).toBe(to);
    }
  });

  it("uses fitting keyboards and autofill hints", () => {
    renderForm();

    expect(screen.getByLabelText("Email")).toHaveProp("keyboardType", "email-address");
    expect(screen.getByLabelText("Email")).toHaveProp("autoCapitalize", "none");
    expect(screen.getByLabelText("Email")).toHaveProp("textContentType", "emailAddress");
    expect(screen.getByLabelText("Full name")).toHaveProp("autoComplete", "name");
    expect(screen.getByLabelText("Year")).toHaveProp("keyboardType", "number-pad");
    expect(screen.getByLabelText("Year")).toHaveProp("maxLength", 4);
    expect(screen.getByLabelText("Model")).toHaveProp("returnKeyType", "done");
  });

  it.each([
    ["Full name", "Enter your name."],
    ["Email", "Enter your email address."],
    ["Year", "Enter your vehicle's year."],
    ["Make", "Enter your vehicle's make."],
    ["Model", "Enter your vehicle's model."],
  ])("shows %s's error when it is left empty", (label, message) => {
    renderForm();

    fireEvent(screen.getByLabelText(label), "blur");

    expect(screen.getByText(message)).toBeOnTheScreen();
    expect(screen.getAllByText(/^Enter /)).toHaveLength(1);
  });

  it("focuses the first invalid field on submit", () => {
    const { onSubmit } = renderForm();
    fireEvent.changeText(screen.getByLabelText("Full name"), "Jane Doe");
    fireEvent.changeText(screen.getByLabelText("Email"), "jane@example.com");
    fireEvent.changeText(screen.getByLabelText("Year"), "12");

    fireEvent.press(screen.getByRole("button", { name: "Book Appointment" }));

    expect(lastFocused()).toBe("Year");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows a submit error right above the button and keeps the answers", () => {
    renderForm({ submitError: "invalid email address" });
    fireEvent.changeText(screen.getByLabelText("Full name"), "Jane Doe");

    expect(screen.getByRole("alert")).toHaveTextContent("invalid email address");
    // Rendered order: last field, then the error, then the button.
    const rendered = JSON.stringify(screen.toJSON());
    const errorAt = rendered.indexOf("invalid email address");
    expect(errorAt).toBeGreaterThan(rendered.indexOf('"Model"'));
    expect(errorAt).toBeLessThan(rendered.indexOf('"Book Appointment"'));
    expect(screen.getByLabelText("Full name")).toHaveProp("value", "Jane Doe");
  });

  it("locks every field while submitting", () => {
    renderForm({ submitting: true });

    for (const label of ["Full name", "Email", "Year", "Make", "Model"]) {
      expect(screen.getByLabelText(label)).toHaveProp("editable", false);
    }
    expect(screen.getByRole("button", { name: "Booking…" })).toBeDisabled();
  });
});
