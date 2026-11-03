import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Linking } from "react-native";
import Link from "./Link";

describe("Link", () => {
  it("opens its URL", () => {
    const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    render(<Link href="tel:5558723289">555-872-3289</Link>);

    fireEvent.press(screen.getByRole("link", { name: "555-872-3289" }));
    expect(openURL).toHaveBeenCalledWith("tel:5558723289");
  });

  it("ignores devices that cannot open the URL", async () => {
    const openURL = jest.spyOn(Linking, "openURL").mockRejectedValue(new Error("No handler"));
    render(<Link href="mailto:help@example.com">help@example.com</Link>);

    fireEvent.press(screen.getByRole("link", { name: "help@example.com" }));
    await waitFor(() => expect(openURL).toHaveBeenCalled());
    expect(screen.getByRole("link")).toBeOnTheScreen();
  });
});
