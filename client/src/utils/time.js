// Small helpers for days and period times.

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Today as "Mon", "Tue", ...
export function today() {
  return DAY_NAMES[new Date().getDay()];
}

// "09:30" -> 570 (minutes since midnight)
function toMinutes(text) {
  const [h, m] = text.trim().split(":").map(Number);
  return h * 60 + (m || 0);
}

// Which period is going on right now? Returns 1, 2, ... or null.
// periodTimes looks like ["09:00-10:00", "10:00-11:00", ...]
export function currentPeriod(periodTimes) {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();

  for (let i = 0; i < periodTimes.length; i++) {
    const parts = (periodTimes[i] || "").split("-");
    if (parts.length !== 2) continue;
    if (minutes >= toMinutes(parts[0]) && minutes < toMinutes(parts[1])) return i + 1;
  }
  return null;
}

// "Good morning" / "Good afternoon" / "Good evening"
export function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// "Sunday, 1 November 2026"
export function longDate() {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// The next working day after "day", e.g. ("Sat", ["Mon".."Fri"]) -> "Mon".
export function nextWorkingDay(workingDays, day) {
  const start = DAY_NAMES.indexOf(day);
  for (let i = 1; i <= 7; i++) {
    const next = DAY_NAMES[(start + i) % 7];
    if (workingDays.includes(next)) return next;
  }
  return null;
}
