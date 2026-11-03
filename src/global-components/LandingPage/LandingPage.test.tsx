import { fireEvent, render, screen } from "@testing-library/react-native";
import { landingPageCopy } from "@copy/landingPage";
import { Linking } from "react-native";
import LandingPage from "./LandingPage";

describe("LandingPage", () => {
  it("displays the heading without API configuration", () => {
    const original = process.env.EXPO_PUBLIC_API_URL;
    delete process.env.EXPO_PUBLIC_API_URL;
    try {
      render(<LandingPage onGetStarted={jest.fn()} />);
      expect(screen.getByRole("header", { name: landingPageCopy.heading })).toBeOnTheScreen();
    } finally {
      if (original === undefined) {
        delete process.env.EXPO_PUBLIC_API_URL;
      } else {
        process.env.EXPO_PUBLIC_API_URL = original;
      }
    }
  });

  it("shows the logo with a text alternative and the intro copy", () => {
    render(<LandingPage onGetStarted={jest.fn()} />);

    expect(screen.getByRole("image", { name: landingPageCopy.logoLabel })).toBeOnTheScreen();
    expect(screen.getByText(landingPageCopy.intro)).toBeOnTheScreen();
  });

  it("starts booking from the button", () => {
    const onGetStarted = jest.fn();
    render(<LandingPage onGetStarted={onGetStarted} />);

    fireEvent.press(screen.getByRole("button", { name: "Get Started" }));
    expect(onGetStarted).toHaveBeenCalledTimes(1);
  });

  it("lists support contacts that open mail and phone", () => {
    const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(true);
    render(<LandingPage onGetStarted={jest.fn()} />);

    fireEvent.press(screen.getByRole("link", { name: "supportbutton@driveway.com" }));
    expect(openURL).toHaveBeenCalledWith("mailto:supportbutton@driveway.com");

    fireEvent.press(screen.getByRole("link", { name: "555-872-3289" }));
    expect(openURL).toHaveBeenCalledWith("tel:5558723289");
  });
});
