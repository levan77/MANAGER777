const SLOT_INTERVAL_MINUTES = 15;

// Maps JavaScript's Date.getDay() (0 = Sunday) to the Prisma DayOfWeek enum.
const JS_DAY_TO_ENUM: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

// ─── Exported types ───────────────────────────────────────────────────────────

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type DayOfWeek =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

// Minimal shapes required — callers may pass full Prisma model objects.

export type AppointmentWindow = {
  staffId: string;
  salonId: string;
  start_time: Date;
  end_time: Date;
  status: AppointmentStatus;
};

export type WorkingHoursWindow = {
  staffId: string;
  day_of_week: DayOfWeek;
  start_time: string; // "HH:MM" 24-hour
  end_time: string;   // "HH:MM" 24-hour
};

export type TimeOffWindow = {
  staffId: string;
  start_datetime: Date;
  end_datetime: Date;
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

// Statuses that physically occupy a slot.
const BLOCKING_STATUSES = new Set<AppointmentStatus>(["PENDING", "CONFIRMED"]);

// Parse an "HH:MM" string into a Date on the same calendar day as `base`.
function parseHHMM(base: Date, hhmm: string): Date {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const result = new Date(base);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns every 15-minute slot on `date` where a new appointment of
 * `serviceDurationMinutes` can start without:
 *
 *   1. Landing outside the staff member's working hours for that day.
 *      → Returns [] immediately if no WorkingHours row exists for the day.
 *
 *   2. Overlapping a TimeOff block (lunch break, vacation, etc.).
 *
 *   3. Overlapping an existing PENDING or CONFIRMED appointment.
 *
 * All three input arrays may be unfiltered; the function narrows each to
 * the relevant staffId / salonId subset internally.
 */
export function getAvailableSlots(
  date: Date,
  staffId: string,
  serviceDurationMinutes: number,
  salonId: string,
  appointments: AppointmentWindow[],
  workingHours: WorkingHoursWindow[],
  timeOffs: TimeOffWindow[]
): Date[] {
  // ── Step 1: confirm the staff member works this day ─────────────────────────
  const dayEnum = JS_DAY_TO_ENUM[date.getDay()];

  const schedule = workingHours.find(
    (wh) => wh.staffId === staffId && wh.day_of_week === dayEnum
  );

  if (!schedule) return []; // not a working day for this staff member

  // ── Step 2: derive the open/close window from the schedule ──────────────────
  const dayStart = parseHHMM(date, schedule.start_time);
  const dayEnd   = parseHHMM(date, schedule.end_time);

  // ── Step 3: narrow appointments to blocking ones for this staff/salon ────────
  const blockingAppts = appointments.filter(
    (a) =>
      a.staffId === staffId &&
      a.salonId === salonId &&
      BLOCKING_STATUSES.has(a.status)
  );

  // ── Step 4: narrow time-off blocks to this staff member ─────────────────────
  const staffTimeOffs = timeOffs.filter((to) => to.staffId === staffId);

  // ── Step 5: generate and filter slots ───────────────────────────────────────
  const serviceDurationMs = serviceDurationMinutes * 60_000;
  const available: Date[] = [];
  const cursor = new Date(dayStart);

  while (cursor < dayEnd) {
    const slotStart = new Date(cursor);
    const slotEnd   = new Date(cursor.getTime() + serviceDurationMs);

    // Slot must end on or before shift end — no overrun past closing time.
    if (slotEnd > dayEnd) break;

    // Two intervals [a,b) and [c,d) overlap iff a < d && b > c.
    const blockedByTimeOff = staffTimeOffs.some(
      (to) => slotStart < to.end_datetime && slotEnd > to.start_datetime
    );

    const blockedByAppt = !blockedByTimeOff && blockingAppts.some(
      (a) => slotStart < a.end_time && slotEnd > a.start_time
    );

    if (!blockedByTimeOff && !blockedByAppt) {
      available.push(slotStart);
    }

    cursor.setMinutes(cursor.getMinutes() + SLOT_INTERVAL_MINUTES);
  }

  return available;
}
