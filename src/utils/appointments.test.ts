import { confirmation, services } from "../../test/fixtures";
import { mockFetch } from "../../test/mockFetch";
import { bookAppointment, getServiceAppointments } from "./appointments";
import { getServices } from "./services";

describe("service API", () => {
  it("getServices loads /services", async () => {
    const fetchSpy = mockFetch({ "GET /services": { body: services } });

    await expect(getServices()).resolves.toEqual(services);
    expect(fetchSpy).toHaveBeenCalledWith("http://api.test/services", expect.anything());
  });

  it("getServiceAppointments loads the service's slots", async () => {
    const fetchSpy = mockFetch({ "GET /appointments/3": { body: [] } });

    await expect(getServiceAppointments(3)).resolves.toEqual([]);
    expect(fetchSpy).toHaveBeenCalledWith("http://api.test/appointments/3", expect.anything());
  });

  it("bookAppointment PATCHes JSON to the booking endpoint", async () => {
    const fetchSpy = mockFetch({ "PATCH /appointments/book/appt-1": { body: confirmation() } });
    const body = { email: "jane@example.com", customerName: "Jane Doe", modelYear: 2005, make: "Mazda", model: "Miata" };

    await expect(bookAppointment("appt-1", body)).resolves.toEqual(confirmation());
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://api.test/appointments/book/appt-1",
      expect.objectContaining({
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
  });

  it("bookAppointment encodes the id into the path", async () => {
    const fetchSpy = mockFetch({ "PATCH /appointments/book/a%2Fb": { body: confirmation() } });

    await bookAppointment("a/b", { email: "e@x.co", customerName: "n", modelYear: 2000, make: "m", model: "m" });
    expect(fetchSpy.mock.calls[0][0]).toBe("http://api.test/appointments/book/a%2Fb");
  });
});
