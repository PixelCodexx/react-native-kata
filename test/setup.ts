import { notifyManager } from "@tanstack/react-query";
import { act } from "@testing-library/react-native";
import { NOW } from "./fixtures";

// React Query notifies subscribers on a timer; wrap those updates in act() so
// background refetches finishing after an assertion don't warn.
notifyManager.setNotifyFunction((callback) => act(callback));

// Freeze the clock (Date only; real timers keep react-query and waitFor
// working) so availability windows and formatted dates are deterministic.
jest.useFakeTimers({
  now: NOW,
  doNotFake: [
    "setTimeout", "clearTimeout", "setInterval", "clearInterval", "setImmediate", "clearImmediate",
    "nextTick", "queueMicrotask", "requestAnimationFrame", "cancelAnimationFrame",
    "requestIdleCallback", "cancelIdleCallback", "hrtime", "performance",
  ],
});

// Default API URL for tests. Tests that check configuration override it.
process.env.EXPO_PUBLIC_API_URL = "http://api.test";

// Reanimated needs native worklets; use the libraries' own Jest mocks
// (animations complete instantly, layout animations are no-ops).
jest.mock("react-native-worklets", () => require("react-native-worklets/src/mock"));
jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

// Keep the real retry policy but skip the backoff waits, and avoid
// garbage-collection timers (queries and mutations) that keep Jest alive.
jest.mock("@utils/queryClient", () => {
  const actual = jest.requireActual("@utils/queryClient");
  return {
    ...actual,
    createQueryClient: () => {
      const client = actual.createQueryClient({ retryDelay: 0, gcTime: Infinity });
      const defaults = client.getDefaultOptions();
      client.setDefaultOptions({ ...defaults, mutations: { ...defaults.mutations, gcTime: Infinity } });
      return client;
    },
  };
});

afterEach(() => {
  jest.restoreAllMocks();
});
