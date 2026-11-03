import { NOW } from "../../test/fixtures";
import {
  EMPTY_BOOKING_FORM,
  toBookingRequest,
  validateBookingForm,
  validateField,
  type BookingFormValues,
} from "./validation";

const valid: BookingFormValues = {
  customerName: "Jane Doe",
  email: "jane@example.com",
  modelYear: "2005",
  make: "Mazda",
  model: "Miata",
};

describe("validateBookingForm", () => {
  it("accepts a complete, valid form", () => {
    expect(validateBookingForm(valid, NOW)).toEqual({});
  });

  it("requires every field", () => {
    expect(validateBookingForm(EMPTY_BOOKING_FORM, NOW)).toEqual({
      customerName: "Enter your name.",
      email: "Enter your email address.",
      modelYear: "Enter your vehicle's year.",
      make: "Enter your vehicle's make.",
      model: "Enter your vehicle's model.",
    });
  });

  it("treats whitespace-only values as empty", () => {
    const blank = { customerName: "  ", email: " ", modelYear: "\t", make: "  ", model: "\n" };

    expect(Object.keys(validateBookingForm(blank, NOW))).toEqual([
      "customerName",
      "email",
      "modelYear",
      "make",
      "model",
    ]);
  });

  it("reports only the invalid fields", () => {
    expect(validateBookingForm({ ...valid, email: "nope" }, NOW)).toEqual({
      email: "Enter a valid email address, like name@example.com.",
    });
  });
});

describe("validateField: email", () => {
  it.each(["jane@example.com", "j.doe+cars@mail.example.co.uk", "  padded@example.com  ", "JohnDoe123@example.com"])(
    "accepts %p",
    (email) => {
      expect(validateField("email", email, NOW)).toBeUndefined();
    },
  );

  it.each(["jane", "jane@", "@example.com", "jane@example", "jane doe@example.com", "jane@@example.com"])(
    "rejects %p",
    (email) => {
      expect(validateField("email", email, NOW)).toBe("Enter a valid email address, like name@example.com.");
    },
  );
});

describe("validateField: modelYear", () => {
  // NOW is in 2026, so next year's models (2027) are allowed.
  it.each(["1900", "2005", "2026", "2027", " 2020 "])("accepts %p", (year) => {
    expect(validateField("modelYear", year, NOW)).toBeUndefined();
  });

  it.each(["abc", "20o5", "205", "20055", "2,005", "-2005", "2005.0"])("rejects %p as not a 4-digit year", (year) => {
    expect(validateField("modelYear", year, NOW)).toBe("Enter a 4-digit year.");
  });

  it.each(["1899", "2028", "0000", "9999"])("rejects out-of-range %p", (year) => {
    expect(validateField("modelYear", year, NOW)).toBe("Enter a year between 1900 and 2027.");
  });
});

describe("toBookingRequest", () => {
  it("trims text and sends the year as a number", () => {
    expect(
      toBookingRequest({
        customerName: "  Jane Doe ",
        email: " jane@example.com ",
        modelYear: " 2005 ",
        make: " Mazda",
        model: "Miata ",
      }),
    ).toEqual({ customerName: "Jane Doe", email: "jane@example.com", modelYear: 2005, make: "Mazda", model: "Miata" });
  });
});
