import { render, screen } from "@testing-library/react-native";
import ServiceIcon from "./ServiceIcon";

describe("ServiceIcon", () => {
  it.each(["Synthetic Oil Change", "Tire Rotation & Inspection", "Express Auto Detailing"])(
    "uses a supplied icon for %s",
    (name) => {
      const { toJSON } = render(<ServiceIcon name={name} />);

      expect(JSON.stringify(toJSON())).toContain("SvgMock");
      expect(screen.queryByText(name.charAt(0))).toBeNull();
    },
  );

  it("falls back to the service's initial when no icon was supplied", () => {
    render(<ServiceIcon name="Brake Inspection" />);

    expect(screen.getByText("B", { includeHiddenElements: true })).toBeOnTheScreen();
  });

  it("is hidden from screen readers, since the card already names the service", () => {
    render(<ServiceIcon name="Brake Inspection" />);

    expect(screen.queryByText("B")).toBeNull();
  });
});
