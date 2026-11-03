// Built from Date getters rather than Intl.formatToParts so output is the same
// on every Hermes build. Times are shown in the device's time zone.
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (value: number) => String(value).padStart(2, "0");

export const ordinal = (day: number): string => {
  const lastTwo = day % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

/** "Monday, May 5th" */
export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  return `${WEEKDAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${ordinal(date.getDate())}`;
};

/** "08:00 AM" */
export const formatTime = (iso: string): string => {
  const date = new Date(iso);
  const hours = date.getHours();
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${pad(hour12)}:${pad(date.getMinutes())} ${hours < 12 ? "AM" : "PM"}`;
};

/** "Monday, May 5th 08:00 AM", matching the services wireframe. */
export const formatDateTime = (iso: string): string => `${formatDate(iso)} ${formatTime(iso)}`;

/** "30 min", "1 hr", "1 hr 30 min". Pass `long` for screen-reader text. */
export const formatDuration = (seconds: number, { long = false } = {}): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "";

  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const hourLabel = long ? (hours === 1 ? "hour" : "hours") : "hr";
  const minuteLabel = long ? (minutes === 1 ? "minute" : "minutes") : "min";

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} ${hourLabel}`);
  if (minutes > 0 || hours === 0) parts.push(`${minutes} ${minuteLabel}`);
  return parts.join(" ");
};
