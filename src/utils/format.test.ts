import { formatDate, formatDateTime, formatDuration, formatTime, ordinal } from "./format";

// Tests run with TZ=UTC (see test/globalSetup.js).
describe("formatDuration", () => {
  it.each([
    [1800, "30 min"],
    [3600, "1 hr"],
    [5400, "1 hr 30 min"],
    [7200, "2 hr"],
    [60, "1 min"],
    [0, "0 min"],
    [89, "1 min"],
    [90, "2 min"],
  ])("formats %i seconds as %p", (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });

  it.each([
    [1800, "30 minutes"],
    [3600, "1 hour"],
    [5400, "1 hour 30 minutes"],
    [7260, "2 hours 1 minute"],
  ])("spells out %i seconds as %p for screen readers", (seconds, expected) => {
    expect(formatDuration(seconds, { long: true })).toBe(expected);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])("returns an empty string for %p", (seconds) => {
    expect(formatDuration(seconds)).toBe("");
  });
});

describe("ordinal", () => {
  it.each([
    [1, "1st"], [2, "2nd"], [3, "3rd"], [4, "4th"], [11, "11th"], [12, "12th"],
    [13, "13th"], [21, "21st"], [22, "22nd"], [23, "23rd"], [30, "30th"], [31, "31st"],
  ])("%i -> %s", (day, expected) => {
    expect(ordinal(day)).toBe(expected);
  });
});

describe("date and time formatting", () => {
  it("formats the date like the wireframe", () => {
    expect(formatDate("2025-05-05T08:00:00.000Z")).toBe("Monday, May 5th");
  });

  it.each([
    ["2025-05-05T08:00:00.000Z", "08:00 AM"],
    ["2025-05-05T00:05:00.000Z", "12:05 AM"],
    ["2025-05-05T12:00:00.000Z", "12:00 PM"],
    ["2025-05-05T14:30:00.000Z", "02:30 PM"],
    ["2025-05-05T23:59:00.000Z", "11:59 PM"],
  ])("formats %s as %s", (iso, expected) => {
    expect(formatTime(iso)).toBe(expected);
  });

  it("combines date and time", () => {
    expect(formatDateTime("2025-05-06T14:00:00.000Z")).toBe("Tuesday, May 6th 02:00 PM");
  });
});
