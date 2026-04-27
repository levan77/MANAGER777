"use client";

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DayOfWeek } from "@/lib/availability";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type DaySchedule = {
  enabled: boolean;
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
};

type WeeklySchedule = Record<DayOfWeek, DaySchedule>;

type TimeOffBlock = {
  id: string;
  start_datetime: string; // datetime-local value "YYYY-MM-DDTHH:MM"
  end_datetime: string;
  label: string;
};

// ─── Static data ──────────────────────────────────────────────────────────────

const MOCK_STAFF = [
  { id: "1", name: "Emma Rose",     role: "Senior Stylist",   initials: "ER" },
  { id: "2", name: "Marcus Chen",   role: "Color Specialist", initials: "MC" },
  { id: "3", name: "Sofia Laurent", role: "Master Stylist",   initials: "SL" },
  { id: "4", name: "Aria Kim",      role: "Texture Expert",   initials: "AK" },
];

const DAYS: DayOfWeek[] = [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY",
];

const DAY_LABEL: Record<DayOfWeek, string> = {
  MONDAY: "Monday", TUESDAY: "Tuesday", WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday", FRIDAY: "Friday", SATURDAY: "Saturday", SUNDAY: "Sunday",
};

// Mon–Fri working, weekends closed — sensible salon default.
const DEFAULT_SCHEDULE: WeeklySchedule = {
  MONDAY:    { enabled: true,  start_time: "09:00", end_time: "18:00" },
  TUESDAY:   { enabled: true,  start_time: "09:00", end_time: "18:00" },
  WEDNESDAY: { enabled: true,  start_time: "09:00", end_time: "18:00" },
  THURSDAY:  { enabled: true,  start_time: "09:00", end_time: "18:00" },
  FRIDAY:    { enabled: true,  start_time: "09:00", end_time: "18:00" },
  SATURDAY:  { enabled: false, start_time: "09:00", end_time: "17:00" },
  SUNDAY:    { enabled: false, start_time: "09:00", end_time: "17:00" },
};

// Seed a couple of lunch-break blocks relative to today.
function buildDefaultTimeOffs(staffId: string): TimeOffBlock[] {
  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const make = (daysOffset: number, startH: number, endH: number, label: string): TimeOffBlock => {
    const base = new Date();
    base.setDate(base.getDate() + daysOffset);
    const start = new Date(base); start.setHours(startH, 0, 0, 0);
    const end   = new Date(base); end.setHours(endH, 0, 0, 0);
    return { id: crypto.randomUUID(), start_datetime: fmt(start), end_datetime: fmt(end), label };
  };

  return [
    make(0, 12, 13, "Lunch break"),
    make(1, 12, 13, "Lunch break"),
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDatetimeLocal(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString("en-US", {
    weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function durationLabel(start: string, end: string): string {
  if (!start || !end) return "";
  const mins = (new Date(end).getTime() - new Date(start).getTime()) / 60_000;
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TogglePill({
  active,
  onChange,
}: {
  active: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!active)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-150",
        active
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-gray-400 hover:bg-gray-200"
      )}
    >
      {active ? <Check className="w-3 h-3" strokeWidth={3} /> : null}
      {active ? "Working" : "Closed"}
    </button>
  );
}

function TimeInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="time"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        "rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-900 tabular-nums",
        "focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors",
        disabled && "opacity-30 cursor-not-allowed bg-gray-50"
      )}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StaffSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const staff = MOCK_STAFF.find((s) => s.id === id);

  const [schedule, setSchedule] = useState<WeeklySchedule>(
    () => structuredClone(DEFAULT_SCHEDULE)
  );
  const [timeOffs, setTimeOffs] = useState<TimeOffBlock[]>(
    () => (staff ? buildDefaultTimeOffs(id) : [])
  );

  // New time-off form state
  const [newStart, setNewStart] = useState("");
  const [newEnd,   setNewEnd]   = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Save feedback
  const [saved, setSaved] = useState(false);

  if (!staff) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-500">Staff member not found.</p>
          <Link href="/dashboard/calendar">
            <Button variant="ghost" className="mt-4 text-gray-500">
              ← Back to Calendar
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Schedule handlers ────────────────────────────────────────────────────────

  function setDay(day: DayOfWeek, patch: Partial<DaySchedule>) {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], ...patch },
    }));
    setSaved(false);
  }

  function handleSaveSchedule() {
    // Validate: for each enabled day, start must be before end.
    for (const day of DAYS) {
      const d = schedule[day];
      if (d.enabled && d.start_time >= d.end_time) {
        // Surface error visually — real impl would use form validation
        return;
      }
    }
    // In production: PATCH /api/staff/:id/working-hours
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  // ── Time-off handlers ────────────────────────────────────────────────────────

  function handleAddTimeOff() {
    setFormError(null);
    if (!newStart || !newEnd) {
      setFormError("Both start and end are required.");
      return;
    }
    if (newStart >= newEnd) {
      setFormError("Start must be before end.");
      return;
    }
    setTimeOffs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        start_datetime: newStart,
        end_datetime: newEnd,
        label: newLabel.trim() || "Time off",
      },
    ]);
    setNewStart("");
    setNewEnd("");
    setNewLabel("");
  }

  function handleDeleteTimeOff(blockId: string) {
    setTimeOffs((prev) => prev.filter((b) => b.id !== blockId));
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 py-12 sm:px-8">

        {/* ── Header ── */}
        <Link
          href="/dashboard/calendar"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Calendar
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-semibold shrink-0">
            {staff.initials}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
              {staff.name}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">{staff.role}</p>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            WEEKLY SCHEDULE
        ════════════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-400">
                Weekly Schedule
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Set the days and hours this staff member is available.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
            {DAYS.map((day) => {
              const d = schedule[day];
              return (
                <div
                  key={day}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 transition-colors",
                    d.enabled ? "bg-white" : "bg-gray-50/60"
                  )}
                >
                  {/* Day name */}
                  <span
                    className={cn(
                      "w-24 text-sm font-medium shrink-0",
                      d.enabled ? "text-gray-900" : "text-gray-400"
                    )}
                  >
                    {DAY_LABEL[day]}
                  </span>

                  {/* Toggle */}
                  <TogglePill
                    active={d.enabled}
                    onChange={(v) => setDay(day, { enabled: v })}
                  />

                  {/* Time range */}
                  <div
                    className={cn(
                      "flex items-center gap-2 ml-auto transition-opacity",
                      !d.enabled && "opacity-30 pointer-events-none"
                    )}
                  >
                    <TimeInput
                      value={d.start_time}
                      onChange={(v) => setDay(day, { start_time: v })}
                      disabled={!d.enabled}
                    />
                    <span className="text-gray-300 text-sm select-none">–</span>
                    <TimeInput
                      value={d.end_time}
                      onChange={(v) => setDay(day, { end_time: v })}
                      disabled={!d.enabled}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save row */}
          <div className="flex items-center justify-end gap-3 mt-4">
            {saved && (
              <span className="text-sm text-emerald-600 font-medium flex items-center gap-1.5 animate-in fade-in duration-200">
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                Schedule saved
              </span>
            )}
            <Button
              onClick={handleSaveSchedule}
              className="bg-gray-900 hover:bg-gray-700 text-white rounded-xl px-6"
            >
              Save Schedule
            </Button>
          </div>
        </section>

        <div className="my-10 border-t border-gray-100" />

        {/* ════════════════════════════════════════════════════════════
            TIME OFF & BREAKS
        ════════════════════════════════════════════════════════════ */}
        <section>
          <div className="mb-5">
            <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-400">
              Time Off &amp; Breaks
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Block specific date/time ranges — lunch breaks, vacations, or personal leave.
            </p>
          </div>

          {/* Add block form */}
          <div className="rounded-2xl border border-gray-200 p-5 mb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Add a Block
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Start
                </label>
                <input
                  type="datetime-local"
                  value={newStart}
                  onChange={(e) => { setNewStart(e.target.value); setFormError(null); }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  End
                </label>
                <input
                  type="datetime-local"
                  value={newEnd}
                  onChange={(e) => { setNewEnd(e.target.value); setFormError(null); }}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">
                Label <span className="text-gray-300">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Lunch break, Annual leave…"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400 transition-colors"
              />
            </div>

            {formError && (
              <p className="text-xs text-red-500 mb-3">{formError}</p>
            )}

            <Button
              onClick={handleAddTimeOff}
              className="bg-gray-900 hover:bg-gray-700 text-white rounded-xl px-5 gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Block
            </Button>
          </div>

          {/* Existing blocks list */}
          {timeOffs.length === 0 ? (
            <div className="flex items-center justify-center h-20 rounded-2xl border border-dashed border-gray-200">
              <p className="text-sm text-gray-400">No blocks added yet.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
              {timeOffs
                .slice()
                .sort((a, b) => a.start_datetime.localeCompare(b.start_datetime))
                .map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center gap-4 px-5 py-4 bg-white group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {block.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {fmtDatetimeLocal(block.start_datetime)}
                        {" "}–{" "}
                        {fmtDatetimeLocal(block.end_datetime)}
                      </p>
                    </div>

                    <span className="text-xs font-medium text-gray-400 tabular-nums shrink-0">
                      {durationLabel(block.start_datetime, block.end_datetime)}
                    </span>

                    <button
                      onClick={() => handleDeleteTimeOff(block.id)}
                      className="shrink-0 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Remove block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
