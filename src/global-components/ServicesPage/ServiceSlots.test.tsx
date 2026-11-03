import { fireEvent, render, screen } from "@testing-library/react-native";
import { appointment, hoursFromNow } from "../../../test/fixtures";
import ServiceSlots from "./ServiceSlots";

const first = appointment({ id: "a", start: hoursFromNow(24) });
const second = appointment({ id: "b", start: hoursFromNow(48) });

describe("ServiceSlots", () => {
  it("offers the slots as unselected radio options", () => {
    render(<ServiceSlots onBook={jest.fn()} slots={[first, second]} />);

    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getAllByRole("radio").every((radio) => !radio.props.accessibilityState.checked)).toBe(true);
  });

  it("only books once a slot is chosen, and books that slot", () => {
    const onBook = jest.fn();
    render(<ServiceSlots onBook={onBook} slots={[first, second]} />);

    fireEvent.press(screen.getByRole("button", { name: "Book Now" }));
    expect(onBook).not.toHaveBeenCalled();

    fireEvent.press(screen.getAllByRole("radio")[0]);
    fireEvent.press(screen.getAllByRole("radio")[1]);
    fireEvent.press(screen.getByRole("button", { name: "Book Now" }));

    expect(onBook).toHaveBeenCalledWith(second);
  });
});
