import { appointment, hoursFromNow, NOW } from "../../test/fixtures";
import { BOOKING_WINDOW_MS, getAvailableSlots } from "./availability";

const windowEnd = new Date(NOW.getTime() + BOOKING_WINDOW_MS).toISOString();

describe("getAvailableSlots", () => {
  it("excludes booked slots", () => {
    const open = appointment({ id: "open" });
    const booked = appointment({ id: "booked", booked: true });

    expect(getAvailableSlots([open, booked], NOW)).toEqual([open]);
  });

  it("excludes past slots and a slot starting exactly now", () => {
    const past = appointment({ id: "past", start: hoursFromNow(-1) });
    const exactlyNow = appointment({ id: "now", start: NOW.toISOString() });
    const future = appointment({ id: "future", start: hoursFromNow(1) });

    expect(getAvailableSlots([past, exactlyNow, future], NOW).map((slot) => slot.id)).toEqual(["future"]);
  });

  it("includes the last moment of the two-week window but nothing after it", () => {
    const atEnd = appointment({ id: "at-end", start: windowEnd });
    const afterEnd = appointment({ id: "after-end", start: new Date(Date.parse(windowEnd) + 1).toISOString() });

    expect(getAvailableSlots([atEnd, afterEnd], NOW).map((slot) => slot.id)).toEqual(["at-end"]);
  });

  it("sorts unsorted slots by start time", () => {
    const later = appointment({ id: "later", start: hoursFromNow(48) });
    const soonest = appointment({ id: "soonest", start: hoursFromNow(2) });
    const middle = appointment({ id: "middle", start: hoursFromNow(10) });

    expect(getAvailableSlots([later, soonest, middle], NOW).map((slot) => slot.id)).toEqual([
      "soonest",
      "middle",
      "later",
    ]);
  });

  it("does not mutate its input", () => {
    const input = [appointment({ id: "b", start: hoursFromNow(5) }), appointment({ id: "a", start: hoursFromNow(1) })];
    const copy = [...input];

    getAvailableSlots(input, NOW);
    expect(input).toEqual(copy);
  });

  it("returns an empty list for no appointments", () => {
    expect(getAvailableSlots([], NOW)).toEqual([]);
  });
});
