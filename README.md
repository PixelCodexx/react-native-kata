# React Native Kata

Build a small service-appointment booking app using **React Native, TypeScript, and Expo**. This is an interviewing exercise, not a production application. Use functional components and hooks, keep your solution practical, and be ready to explain your decisions.

The starter is deliberately incomplete. It displays a welcome heading and supplies navigation wiring, a reusable button, assets, tests, and a mock API. **You implement the booking journey.** Running on either iOS or Android in **Expo Go** is sufficient; web-only execution is not.

## Contents

- [Quick start](#quick-start)
- [Your tasks](#your-tasks)
- [Provided starter](#provided-starter)
- [Commands](#commands)
- [API reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Submission and interview](#submission-and-interview)
- [Solution overview](#solution-overview)

## Quick start

### Prerequisites

- Node.js **22 LTS, version 22.13 or newer** within the Node 22 release line, with npm. `.nvmrc` selects Node 22.
- Git installed on your computer.
- [Expo Go](https://expo.dev/go) installed on your iPhone or Android phone, with support for this project's Expo SDK 57.
- Your computer and phone on a network that permits communication between them.

This starter uses **Expo SDK 57**, React 19.2.3, and React Native 0.86.3. No employee account, private package feed, Expo account, signing setup, or native build is required.

### Start on a physical phone

1. Fork the exercise repository supplied by your interviewer. Replace `<YOUR_FORK_URL>` with your fork's URL:

   ```sh
   git clone <YOUR_FORK_URL> react-native-kata
   cd react-native-kata
   ```

   If you use nvm, run `nvm install` and `nvm use` in this directory to select Node 22. Then install dependencies with `npm ci`.

2. Copy `.env.example` to `.env.local`. On macOS/Linux use `cp .env.example .env.local`; on Windows PowerShell use `Copy-Item .env.example .env.local`.

3. Find your computer's local IPv4 address in its Wi-Fi/network settings, then edit `.env.local`:

   ```dotenv
   EXPO_PUBLIC_API_URL=http://192.168.1.25:2000
   ```

   Replace `192.168.1.25` with **your computer's address**, not your phone's. This is the base URL; do not append `/services`.

4. In **terminal A**, from `react-native-kata`, start the API and leave it running:

   ```sh
   npm run server
   ```

5. In **terminal B**, also from `react-native-kata`, start Expo and leave it running:

   ```sh
   npm start
   ```

6. Open the project in Expo Go. On iPhone, scan the terminal's QR code with Camera and open its link. On Android, scan it through Expo Go. You should see the welcome heading. The unfinished booking features will not work until you implement them.

`npm start` starts Metro, which serves the app's JavaScript. The separate Express process serves the booking API. Keep both processes running. App requests must use the configured absolute API base URL; Metro does not forward requests to the API.

### API addresses by runtime

| Runtime | `EXPO_PUBLIC_API_URL` |
| --- | --- |
| Physical phone | `http://<COMPUTER_LAN_IP>:2000` |
| iOS Simulator on the API computer | `http://localhost:2000` |
| Standard Android Studio Emulator | `http://10.0.2.2:2000` |

On a phone, `localhost` means the phone, not your computer. A firewall, VPN, or isolated Wi-Fi network can block access. Expo's Metro tunnel does **not** expose the separate API.

Use `.env.local` for local configuration; it is ignored by Git. `EXPO_PUBLIC_*` values are included in the app bundle and **must not contain secrets**. Restart Expo and reload the app after changing the URL.

### Optional simulator or emulator

A phone is sufficient. If you prefer a simulator/emulator, follow Expo's [iOS Simulator guide](https://docs.expo.dev/workflow/ios-simulator/) or [Android Emulator guide](https://docs.expo.dev/workflow/android-studio-emulator/), choose the corresponding API address above, and run `npm run ios` or `npm run android` instead of `npm start`.

These scripts open **Expo Go**, not a custom native build. CocoaPods, an NDK, code signing, EAS, and `expo run:*` are not part of the required workflow.

## Your tasks

Plan to spend **1–2 hours** working independently before the interview. Read the requirements and API, decide how to organize your solution, then implement and test what you can. Be ready to discuss priorities and trade-offs.

### Booking requirements

| Step | Expected behavior |
| --- | --- |
| Landing page | Show the supplied logo, introductory copy, and a button to begin. Include `supportbutton@driveway.com` and `555-872-3289`. |
| Services | Show services with available appointment slots within the next two weeks. |
| Appointments | Let the user select a service and see its available slots. |
| Booking | Let the user select a slot and enter their name, email, and vehicle year, make, and model to book it. |
| Confirmation | Show the details returned by the API after a successful booking. |

### Engineering expectations

- Use functional React components and hooks.
- Show useful loading, empty, and error states. Give the user a way to recover when requests fail; don't show a successful confirmation for a failed booking.
- Keep forms and controls usable on a phone, including scrolling, keyboard behavior, safe areas, and accessible labels.
- Test meaningful behavior and be prepared to explain what you tested.
- You may add Expo Go-compatible supporting libraries for fetching, state, or forms. Keep React Native and Expo as the framework; avoid dependencies requiring custom native builds.
- Do not overbuild. Authentication, offline booking, persistent storage, notifications, and production infrastructure are not required.

The backend intentionally fails some appointment-list requests. Resilience means useful feedback and recovery, not guaranteeing bookings while the API is unavailable.

`GET /services` returns service definitions, not availability. Use the appointment endpoints to determine which services have unbooked slots within the next two weeks. Filter out past slots in the client, since the mock API does not remove them as time passes.

## Provided starter

The repository is organized by app routes, reusable UI, shared utilities, and the separate mock API:

| Location | Purpose |
| --- | --- |
| `assets/` | Expo app icons. |
| `src/app/` | Expo Router stack (`_layout.tsx`) and initial route (`index.tsx`). Add new screens here. |
| `src/assets/` | Supplied logo, SVG icons, and SVG type declarations. |
| `src/copy/` | Shared copy, including landing-page text. |
| `src/core-components/` | Reusable UI components, such as `Button/`, with their tests. |
| `src/global-components/` | Feature-level components, such as `LandingPage/`, with their tests. |
| `src/server/` | Separate in-memory Express API. |
| `src/styles/` | Shared style tokens, including colors. |
| `src/utils/` | Shared utilities, API URL validation, and service API TODO. |
| `test/` | Jest mocks, including the SVG import mock. |
| `wireframes/` | Landing page and services visual references; adapt them to phone screens rather than matching desktop dimensions. |
| `app.json` | Expo app configuration. |
| `eslint.config.js`, `jest.config.js`, `metro.config.js` | Lint, test, and Metro configuration. |
| `tsconfig.json`, `tsconfig-server.json` | TypeScript configuration for the app and API. |

Add new screens under `src/app/`; keep reusable components, utilities, and their tests in the corresponding source folders. The button is at `src/core-components/Button/`, and the landing-page component is at `src/global-components/LandingPage/`.

Navigation and dependency setup are provided; service fetching, additional screens, forms, request recovery, and confirmation are your work. The initial heading can render without API configuration, but requests need a valid URL.

TypeScript aliases are configured in `tsconfig.json`: `@assets/*`, `@copy/*`, `@core-components/*`, `@global-components/*`, `@styles/*`, and `@utils/*`. Jest maps the same aliases in `jest.config.js`. PNG assets use normal React Native image sources. SVG component imports are configured:

```tsx
import OilChangeIcon from "@assets/oil-change-icon.svg";

// Render inside your component:
<OilChangeIcon width={32} height={32} />;
```

![Supplied logo](src/assets/logo.png)

Wireframes: [Landing page](wireframes/landing-page.png) and [Services](wireframes/services.png).

## Commands

Run all commands from `react-native-kata`.

| Command | Purpose |
| --- | --- |
| `npm start` | Start Metro for Expo Go. |
| `npm run ios` | Start Metro and open Expo Go in an iOS Simulator. |
| `npm run android` | Start Metro and open Expo Go in an Android Emulator. |
| `npm run server` | Compile and start only the Express API on port 2000. |
| `npm test` | Run native starter tests without a running API. |
| `npm run lint` | Run Expo's ESLint configuration on the mobile starter. |
| `npm run typecheck` | Check mobile TypeScript without emitting files. |
| `npm run typecheck:server` | Check server TypeScript separately. |

The API honors `SERVERPORT` if you need a different port. Update the URL's port too. Do not stop unrelated processes to free the default port.

## API reference

All paths below are relative to `EXPO_PUBLIC_API_URL`. Dates are ISO 8601 strings. **Durations are numeric seconds**; format them for display in your UI.

The server generates appointments between startup and 14 days after startup. It does not continually regenerate/filter by a rolling clock. Bookings live only in memory: restarting the server resets bookings and generates new slots.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/services` | Return service definitions. |
| GET | `/appointments` | Return all stored appointments, including booked ones. |
| GET | `/appointments/:serviceId` | Return unbooked appointments for the service. Approximately 20% of requests intentionally return 500. |
| PATCH | `/appointments/book/:id` | Book a slot and return its confirmation. |

### GET /services

Returns HTTP 200 with a JSON array. Each service has numeric `id`, string `name`, and numeric `duration` in seconds:

```json
[
  { "id": 1, "name": "Synthetic Oil Change", "duration": 1800 },
  { "id": 2, "name": "Brake Inspection", "duration": 1800 },
  { "id": 3, "name": "Tire Rotation & Inspection", "duration": 3600 },
  { "id": 4, "name": "Express Auto Detailing", "duration": 5400 }
]
```

### GET /appointments

Returns HTTP 200 with all stored appointments. Booked entries also contain the submitted customer/vehicle fields. Do not assume every entry is available.

### GET /appointments/:serviceId

Returns HTTP 200 with unbooked slots for the selected service, or an empty array if none remain. Slots are not guaranteed to be sorted by start time; sort them in the client for display. Example for service 1 (IDs and timestamps are illustrative; use the actual returned values):

```json
[
  {
    "id": "972836c4-a389-4b23-9709-78cf33c246ed",
    "serviceName": "Synthetic Oil Change",
    "serviceId": 1,
    "start": "2026-10-10T08:30:00.000Z",
    "duration": 1800,
    "booked": false
  }
]
```

`booked` is always present. Stored booked appointments may include `email`, `customerName`, `modelYear`, `make`, and `model`.

Errors are plain text, not JSON:

| Status | Body |
| --- | --- |
| 400 | `invalid serviceId` when the value cannot be parsed as an integer or parses to zero |
| 500 | `Unable to load appointments. Please try again.` |

An unknown nonzero service ID returns an empty array on a non-failing request. Check response status before decoding success JSON.

### PATCH /appointments/book/:id

Use an actual appointment ID and send `Content-Type: application/json`. Required fields are `email`, `customerName`, `modelYear`, `make`, and `model`.

```json
{
  "email": "JohnDoe123@example.com",
  "customerName": "John Doe",
  "modelYear": 2005,
  "make": "Mazda",
  "model": "Miata"
}
```

The mock API checks these fields for truthiness, not email format, a valid year, or runtime types. Numeric `modelYear` values are recommended; a submitted string year is also echoed unchanged. Decide appropriate form validation in your client.

Successful booking returns HTTP 200:

```json
{
  "id": "972836c4-a389-4b23-9709-78cf33c246ed",
  "serviceName": "Synthetic Oil Change",
  "start": "2026-10-10T08:30:00.000Z",
  "duration": 1800,
  "booked": true,
  "email": "JohnDoe123@example.com",
  "customerName": "John Doe",
  "modelYear": 2005,
  "make": "Mazda",
  "model": "Miata"
}
```

Booking validation errors return HTTP 400 with one of these plain-text bodies:

- `Invalid appointment id`
- `This appointment is already booked.`
- `invalid email address`
- `invalid customer name`
- `invalid make/model/modelYear`

The booked slot disappears from the service-filtered list but remains in `/appointments`. The booking endpoint does not inject random failures.

## Troubleshooting

| Symptom | What to check |
| --- | --- |
| Phone cannot load the app | Keep Metro running, confirm network access, and check the Expo terminal. A Metro tunnel can help with Metro access, but not API access. |
| API requests fail to connect | Keep terminal A running; check your computer's LAN IP, port, firewall, VPN, and shared network. Open `http://<COMPUTER_LAN_IP>:2000/services` in the phone's browser to isolate connectivity. |
| API URL configuration error | Set `EXPO_PUBLIC_API_URL` to an absolute HTTP(S) URL in `.env.local`, then restart Expo and reload. |
| Heading renders but no booking UI appears | Expected: the starter is intentionally unfinished. |
| Appointment fetch returns 500 | Expected intermittent failure; implement error feedback and recovery. |
| Expo Go says the SDK is incompatible | Use an Expo Go release supporting SDK 57. See [Expo Go downloads](https://expo.dev/go); ask your interviewer if store support has moved on. |
| Metro cache appears stale | Stop your Metro process and run `npm start -- --clear`. |

Use trusted network/certificate configuration if your machine needs it; do not disable TLS verification. Internal company accounts or documentation are not prerequisites.

## Submission and interview

Work in your personal fork and push your code **at least 24 hours before the interview** so it can be reviewed.

Be prepared to discuss your implementation, testing, priorities, and trade-offs. The interview includes a live-coding enhancement to your solution.

## Solution overview

The booking journey is implemented end to end and runs in Expo Go on iOS and Android.

### What's built

| Route | Screen | What it does |
| --- | --- | --- |
| `/` | `LandingPage` | Logo, intro copy, **Get Started**, and tappable support email (`mailto:`) and phone (`tel:`). |
| `/services` | `ServicesPage` | Services with bookable slots in the next 14 days, as expandable cards (per the wireframe). Each card lists its slots, sorted, as radio options with **Book Now**. Pull to refresh. |
| `/book/[appointmentId]?serviceId=` | `BookingPage` | Re-checks the slot is still offered, shows it, and collects name, email and vehicle year/make/model. |
| `/confirmation/[appointmentId]` | `ConfirmationPage` | Shows exactly what the booking API returned, then **Book another service**. |

Route files in `src/app/` only read params and wire navigation. Screens live in `src/global-components/`, reusable pieces in `src/core-components/`, and data and logic in `src/utils/`.

### Key decisions

**Privacy: the app never calls `GET /appointments`.** That endpoint returns booked slots, including other customers' names and emails. Availability comes only from `GET /appointments/:serviceId`, which returns unbooked slots with no customer data. A test fails if any journey requests `/appointments`.

**Availability and the intentional 500s**
- Every service's slots are fetched in parallel. A service is shown only if it has an unbooked slot starting after now and within 14 days. Slots are sorted in the client.
- Failed reads retry twice with backoff (500 ms, then 1 s), which absorbs most of the random 500s without the user noticing. 4xx responses are not retried, because the request itself was rejected.
- If a service still fails, it stays in the list as a card with its own **Try again**, which re-requests only that service. The other services stay usable. A full-screen error appears only when nothing could load.
- If a refresh fails, the last good list stays on screen with an inline notice.

**Booking safety**
- **No accidental resubmits.** Bookings are never retried automatically, and the button and fields lock while a request is in flight.
- **The slot is re-checked first.** The booking screen looks the slot up through its service before showing the form. A booked, past or unknown slot (for example from a stale link) offers **Choose another time** instead.
- **No false confirmations.** Navigation to the confirmation happens only on success, and the server's error appears beside the submit button with the form values kept. `This appointment is already booked.` refreshes availability and offers another time.
- **No back-navigation into a used form.** The confirmation replaces the form in history.
- **No personal data in the URL.** The confirmation is held in the in-memory query cache, never in route params.

**Networking** (`src/utils/http.ts`)
- Checks the status before decoding, because errors are plain text.
- Turns network failures, a 15 s timeout and malformed JSON into readable messages. The timeout matters because a wrong LAN IP on a phone can otherwise hang for about a minute.

**Validation**
- Every field is required and trimmed. Email uses a simple pattern.
- The year must be 4 digits, from 1900 to next year, and is sent as a number.
- Errors appear when a field loses focus or on submit, then update live as the user types. A failed submit focuses the first invalid field.

**Phone usability**
- Safe areas throughout, scrolling on every screen, and touch targets of 44 pt or more.
- The keyboard's next key moves through the fields, with the right keyboard type and autofill hint for each.
- Screen readers get roles and states for every control: headers, buttons with their expanded state, radio options with their checked state, alerts and links. Each field has a label, and its error is read out with it.
- On Android, `KeyboardAvoidingView` measures itself from below the navigation header and under-counts the keyboard by that height. The booking screen passes the header height as `keyboardVerticalOffset` so the focused field stays visible. This was verified on device.

**Motion:** small animations built with the starter's Reanimated: list items fade in, the caret rotates, notices fade in, and the confirmation tick springs in. All follow the OS "Reduce Motion" setting.

**Libraries:** only `@tanstack/react-query` (pure JS, Expo Go compatible) was added, for caching, retries, refetching and cache invalidation after a booking. The form is small enough that a form library would be overbuilding.

**Starter fixes**
- `getApiBaseUrl` read the environment variable once at import time, so 3 of its own tests failed. It now reads the variable on each call.
- In `jest.config.js`, the `@assets/*` alias matched before the SVG mock, so aliased SVG imports rendered as objects in tests. The SVG mapper now comes first.

### Tests

`npm test` runs **214 Jest tests** (React Native Testing Library) without a running API. Test helpers are in `test/`. Each test has a fixed clock and time zone, and `fetch` is mocked per route.
- **Logic:** availability filtering and its boundaries, date and duration formatting, validation, the retry policy, and the HTTP client (plain-text errors, timeout, malformed JSON, missing configuration).
- **Components and screens:** loading, empty, partial-failure and error states with recovery; slot selection; field order for the keyboard's next key; inline errors; locked fields while sending; every booking error the server can return; and never confirming a failed booking.
- **Full journeys** with `expo-router/testing-library`, running through the real routes against a stateful fake API:
  - the happy path, plus history after booking
  - one service failing until retried
  - a slot taken by someone else mid-booking, then booking another
  - opening stale links directly
  - each journey also asserts that `/appointments` was never called

GitHub Actions (`.github/workflows/ci.yml`) runs lint, both typechecks and the Jest suite on every push and pull request.

### End-to-end tests (Maestro)

The flows in `.maestro/` drive the real app in Expo Go against the mock API:

| Flow | Covers |
| --- | --- |
| `landing.yaml` | Heading, logo, copy and support contacts. |
| `book-appointment.yaml` | Services (tapping **Try again** if an intentional 500 survives the retries), then slot, form, the API's confirmation, and back to services. |
| `booking-validation.yaml` | Empty and invalid submissions show errors and never confirm. |
| `stale-link.yaml` | Opening a booking link for a slot that doesn't exist. |

To run them:
1. Install the [Maestro CLI](https://docs.maestro.dev/getting-started/installing-maestro).
2. Keep `npm run server` and `npm run ios` (or `npm run android`) running.
3. Run:

```sh
npm run e2e          # iOS Simulator (exp://127.0.0.1:8081)
npm run e2e:android  # Android Emulator (exp://10.0.2.2:8081)
```

The scripts pass `APP_ID` and `EXPO_URL` to the flows. Expo Go's ID is case-sensitive: `host.exp.Exponent` on iOS and `host.exp.exponent` on Android. If a simulator and an emulator are both running, add `-- --device <id>`.

The flows fill the form using the keyboard's next key, as a user would, so they also cover the field order. Both platforms pass all 4 flows against the real mock API, intentional 500s included.

Each booking run uses up a real slot, and the mock API only creates 2–5 per service when it starts. If the services screen says nothing is available, restart `npm run server` to reset the slots.

### Trade-offs and next steps

- **Request count.** Loading the services screen makes one request per service (4 here). That's fine at this size. With many services, I'd ask for a server endpoint that returns availability for all services without customer data.
- **Display formats.** Dates and times use the device's time zone in an English format matching the wireframe. Localisation would replace the hand-written formatter with `Intl`.
- **Possible slight staleness.** The slots in an open card may be up to 30 seconds old. The booking screen re-checks before the form is shown, and the server has the final say when the booking is sent.
- **Brake Inspection has no supplied icon,** so it shows a neutral initial.
- **Dependency versions.** `npx expo install --check` suggests patch updates to the starter's Expo packages. I kept the starter's versions.
