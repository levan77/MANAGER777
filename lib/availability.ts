const SLOT_INTERVAL_MINUTES = 15;
const BUSINESS_START_HOUR = 9; // 09:00
const BUSINESS_END_HOUR = 18; // 18:00 (6 PM)

// Statuses that physically occupy a slot. CANCELLED / NO_SHOW / COMPLETED do not.
const BLOCKING_STATUSES = new Set<AppointmentStatus>(["PENDING", "CONFIRMED"]);

export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

// Minimal shape required — callers may pass full Prisma Appointment objects.
export type AppointmentWindow = {
  staffId: string;
  salonId: string;
  start_time: Date;
  end_time: Date;
  status: AppointmentStatus;
};

/**
 * Returns every 15-minute slot between 09:00 and 18:00 on `date` where
 * a new appointment of `serviceDurationMinutes` can start without:
 *   a) running past 18:00, or
 *   b) overlapping a blocking appointment for this staff member.
 *
 * The `appointments` array may be unfiltered; the function narrows it
 * to the relevant staffId + salonId + blocking-status subset internally.
 */
export function getAvailableSlots(
  date: Date,
  staffId: string,
  serviceDurationMinutes: number,
  salonId: string,
  appointments: AppointmentWindow[]
): Date[] {
  const blocking = appointments.filter(
    (a) =>
      a.staffId === staffId &&
      a.salonId === salonId &&
      BLOCKING_STATUSES.has(a.status)
  );

  const dayStart = new Date(date);
  dayStart.setHours(BUSINESS_START_HOUR, 0, 0, 0);

  const dayEnd = new Date(date);
  dayEnd.setHours(BUSINESS_END_HOUR, 0, 0, 0);

  const serviceDurationMs = serviceDurationMinutes * 60_000;
  const available: Date[] = [];
  const cursor = new Date(dayStart);

  while (cursor < dayEnd) {
    const slotStart = new Date(cursor);
    const slotEnd = new Date(cursor.getTime() + serviceDurationMs);

    // Slot must end on or before closing time.
    if (slotEnd > dayEnd) break;

    // Two intervals [a,b) and [c,d) overlap iff a < d && b > c.
    const overlaps = blocking.some(
      (appt) => slotStart < appt.end_time && slotEnd > appt.start_time
    );

    if (!overlaps) {
      available.push(slotStart);
    }

    cursor.setMinutes(cursor.getMinutes() + SLOT_INTERVAL_MINUTES);
  }

  return available;
}
