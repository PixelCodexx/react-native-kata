const message =
  "Set EXPO_PUBLIC_API_URL in .env.local to an absolute http:// or https:// API URL reachable from your device.";

export const getApiBaseUrl = (): string => {
  // Read on each call (not at module load) so the value can't go stale. Keep
  // dot access so Expo can still inline it at build time.
  const value = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (!value || !URL.canParse(value)) {
    throw new Error(message);
  }

  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    !url.hostname ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new Error(message);
  }

  return value.replace(/\/+$/, "");
}
