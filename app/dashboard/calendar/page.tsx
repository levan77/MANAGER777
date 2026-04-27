"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Globe, Phone, User, Wifi, WifiOff, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Grid geometry ────────────────────────────────────────────────────────────

const HOUR_PX = 96;       // pixels per hour
const DAY_START = 9;      // 09:00
const DAY_END = 18;       // 18:00
const TOTAL_HOURS = DAY_END - DAY_START;
const GRID_PX = TOTAL_HOURS * HOUR_PX;  // 864 px
const PX_PER_MIN = HOUR_PX / 60;        // 1.6 px / min
const COL_MIN_W = 180;    // px, minimum staff column width

// Replace with the authenticated salon's id in production.
const MOCK_SALON_ID = "salon_demo_01";

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
type Source = "ONLINE" | "PHONE" | "WALK_IN";

type CalendarAppt = {
  id: string;
  start_time: Date;
  end_time: Date;
  status: Status;
  source: Source;
  salonId: string;
  staffId: string;
  serviceId: string;
  userId: string;
  // Denormalized for display; in production these come from joined queries.
  clientName: string;
  serviceName: string;
};

// Shape of the raw row returned by Supabase Realtime (dates are ISO strings).
type RawApptRow = Omit<CalendarAppt, "start_time" | "end_time"> & {
  start_time: string;
  end_time: string;
};

type Toast = { id: string; title: string; body: string };

// ─── Static data ─────────────────────────────────────────────────────────────

const STAFF_LIST = [
  { id: "1", name: "Emma Rose",     role: "Senior Stylist",   initials: "ER" },
  { id: "2", name: "Marcus Chen",   role: "Color Specialist", initials: "MC" },
  { id: "3", name: "Sofia Laurent", role: "Master Stylist",   initials: "SL" },
  { id: "4", name: "Aria Kim",      role: "Texture Expert",   initials: "AK" },
];

// ─── Mock appointments ────────────────────────────────────────────────────────

function buildMockAppts(base: Date): CalendarAppt[] {
  const at = (h: number, m: number): Date => {
    const d = new Date(base);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const rows: Omit<CalendarAppt, "salonId" | "serviceId" | "userId">[] = [
    { id: "a1",  staffId: "1", status: "CONFIRMED", source: "ONLINE",   clientName: "Jade Morris",    serviceName: "Haircut & Style",   start_time: at(9,30),  end_time: at(10,15) },
    { id: "a2",  staffId: "1", status: "CONFIRMED", source: "ONLINE",   clientName: "Priya Kapoor",   serviceName: "Balayage",           start_time: at(11,0),  end_time: at(13,30) },
    { id: "a3",  staffId: "1", status: "PENDING",   source: "PHONE",    clientName: "Rachel Tan",     serviceName: "Color Touch-Up",     start_time: at(14,0),  end_time: at(15,0)  },
    { id: "a4",  staffId: "2", status: "CONFIRMED", source: "ONLINE",   clientName: "Diana Osei",     serviceName: "Balayage",           start_time: at(9,0),   end_time: at(11,30) },
    { id: "a5",  staffId: "2", status: "CONFIRMED", source: "WALK_IN",  clientName: "Tina Alvarez",   serviceName: "Blow Dry & Style",   start_time: at(12,30), end_time: at(13,30) },
    { id: "a6",  staffId: "2", status: "COMPLETED", source: "ONLINE",   clientName: "Mia Chen",       serviceName: "Deep Conditioning",  start_time: at(14,30), end_time: at(15,30) },
    { id: "a7",  staffId: "3", status: "CONFIRMED", source: "PHONE",    clientName: "Sarah Mitchell", serviceName: "Keratin Treatment",  start_time: at(9,30),  end_time: at(11,30) },
    { id: "a8",  staffId: "3", status: "PENDING",   source: "ONLINE",   clientName: "Lucy Park",      serviceName: "Haircut & Style",    start_time: at(13,0),  end_time: at(13,45) },
    { id: "a9",  staffId: "4", status: "NO_SHOW",   source: "ONLINE",   clientName: "Zoe Farrell",    serviceName: "Color Touch-Up",     start_time: at(10,0),  end_time: at(11,0)  },
    { id: "a10", staffId: "4", status: "CONFIRMED", source: "ONLINE",   clientName: "Natalie Ford",   serviceName: "Balayage",           start_time: at(11,30), end_time: at(13,30) },
    { id: "a11", staffId: "4", status: "PENDING",   source: "WALK_IN",  clientName: "Iris Wang",      serviceName: "Blow Dry & Style",   start_time: at(15,0),  end_time: at(16,0)  },
  ];

  return rows.map((r) => ({ ...r, salonId: MOCK_SALON_ID, serviceId: "s1", userId: "u1" }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function apptGeometry(appt: CalendarAppt): { top: number; height: number } {
  const startMins =
    (appt.start_time.getHours() - DAY_START) * 60 +
    appt.start_time.getMinutes();
  const durationMins =
    (appt.end_time.getTime() - appt.start_time.getTime()) / 60_000;
  return {
    top: startMins * PX_PER_MIN,
    height: Math.max(durationMins * PX_PER_MIN, 24),
  };
}

const fmt12 = (d: Date) =>
  d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

const fmtHeader = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function rawToAppt(raw: RawApptRow): CalendarAppt {
  return {
    ...raw,
    start_time: new Date(raw.start_time),
    end_time: new Date(raw.end_time),
    clientName: raw.clientName ?? "New Client",
    serviceName: raw.serviceName ?? "—",
  };
}

// ─── Style maps ───────────────────────────────────────────────────────────────

const CARD_CLS: Record<Status, string> = {
  PENDING:   "bg-sky-50    border-sky-200    text-sky-900",
  CONFIRMED: "bg-emerald-50 border-emerald-200 text-emerald-900",
  COMPLETED: "bg-gray-100  border-gray-200   text-gray-500",
  CANCELLED: "bg-red-50    border-red-200    text-red-500",
  NO_SHOW:   "bg-amber-50  border-amber-200  text-amber-800",
};

const DOT_CLS: Record<Status, string> = {
  PENDING:   "bg-sky-400",
  CONFIRMED: "bg-emerald-400",
  COMPLETED: "bg-gray-300",
  CANCELLED: "bg-red-300",
  NO_SHOW:   "bg-amber-400",
};

const STATUS_LABEL: Record<Status, string> = {
  PENDING:   "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  NO_SHOW:   "No Show",
};

const SourceIcon = ({ source }: { source: Source }) => {
  const cls = "w-2.5 h-2.5 shrink-0";
  if (source === "ONLINE")  return <Globe className={cls} />;
  if (source === "PHONE")   return <Phone className={cls} />;
  return <User className={cls} />;
};

// ─── Appointment block ────────────────────────────────────────────────────────

function ApptBlock({ appt }: { appt: CalendarAppt }) {
  const { top, height } = apptGeometry(appt);
  const compact = height < 48;
  const spacious = height >= 72;

  return (
    <div
      className={cn(
        "absolute left-1 right-1 rounded-lg border px-2 py-1.5 overflow-hidden",
        "cursor-pointer transition-all duration-150 hover:shadow-md hover:z-10",
        CARD_CLS[appt.status]
      )}
      style={{ top, height }}
    >
      <div className="flex items-start justify-between gap-1">
        <p className={cn("font-semibold leading-tight truncate", compact ? "text-[10px]" : "text-xs")}>
          {appt.clientName}
        </p>
        <span className="opacity-50 mt-px">
          <SourceIcon source={appt.source} />
        </span>
      </div>

      {!compact && (
        <p className="text-[10px] leading-tight opacity-70 truncate mt-0.5">
          {appt.serviceName}
        </p>
      )}

      {height >= 60 && (
        <p className="text-[10px] leading-tight opacity-60 mt-0.5">
          {fmt12(appt.start_time)} – {fmt12(appt.end_time)}
        </p>
      )}

      {spacious && (
        <div className="flex items-center gap-1 mt-1.5">
          <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", DOT_CLS[appt.status])} />
          <span className="text-[9px] uppercase tracking-wide font-semibold opacity-60">
            {STATUS_LABEL[appt.status]}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState(today);
  const [appointments, setAppointments] = useState<CalendarAppt[]>(() =>
    buildMockAppts(today)
  );
  const [isLive, setIsLive] = useState(false);
  const [nowTop, setNowTop] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Keep a ref so the stable realtime callback can read the latest date.
  const selectedDateRef = useRef(selectedDate);
  useEffect(() => { selectedDateRef.current = selectedDate; }, [selectedDate]);

  // Refresh mock appointments whenever the viewed date changes.
  useEffect(() => {
    setAppointments(buildMockAppts(selectedDate));
  }, [selectedDate]);

  // Current-time indicator — update every minute.
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const mins = (now.getHours() - DAY_START) * 60 + now.getMinutes();
      setNowTop(mins >= 0 && mins <= TOTAL_HOURS * 60 ? mins * PX_PER_MIN : null);
    };
    tick();
    const timer = setInterval(tick, 60_000);
    return () => clearInterval(timer);
  }, []);

  // ── Supabase Realtime subscription ──────────────────────────────────────────
  useEffect(() => {
    let supabase: ReturnType<typeof createSupabaseBrowserClient>;

    try {
      supabase = createSupabaseBrowserClient();
    } catch {
      // Env vars not configured yet; realtime disabled in local dev.
      return;
    }

    const channel = supabase
      .channel(`dashboard:${MOCK_SALON_ID}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Appointment",
          filter: `salonId=eq.${MOCK_SALON_ID}`,
        },
        (payload) => {
          const viewDate = selectedDateRef.current;

          if (payload.eventType === "INSERT") {
            const appt = rawToAppt(payload.new as RawApptRow);
            // Only add to the visible day's state.
            if (!isSameDay(appt.start_time, viewDate)) return;
            setAppointments((prev) => [...prev, appt]);
            pushToast({
              title: "New booking",
              body: `${appt.clientName} — ${appt.serviceName} at ${fmt12(appt.start_time)}`,
            });
          }

          if (payload.eventType === "UPDATE") {
            const updated = rawToAppt(payload.new as RawApptRow);
            setAppointments((prev) =>
              prev.map((a) =>
                a.id === updated.id
                  ? // Preserve denormalized display fields if the payload omits them.
                    { ...updated, clientName: updated.clientName || a.clientName, serviceName: updated.serviceName || a.serviceName }
                  : a
              )
            );
            if (isSameDay(updated.start_time, viewDate)) {
              pushToast({
                title: "Appointment updated",
                body: `${updated.clientName} is now ${STATUS_LABEL[updated.status].toLowerCase()}.`,
              });
            }
          }

          if (payload.eventType === "DELETE") {
            const deletedId = (payload.old as { id: string }).id;
            setAppointments((prev) => prev.filter((a) => a.id !== deletedId));
          }
        }
      )
      .subscribe((status) => setIsLive(status === "SUBSCRIBED"));

    return () => {
      supabase.removeChannel(channel);
      setIsLive(false);
    };
  // Intentionally no deps — one subscription for the component lifetime.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toast helpers ────────────────────────────────────────────────────────────

  function pushToast({ title, body }: { title: string; body: string }) {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, title, body }]);
    setTimeout(() => dismissToast(id), 5000);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Derived stats ────────────────────────────────────────────────────────────

  const confirmed = appointments.filter((a) => a.status === "CONFIRMED").length;
  const pending   = appointments.filter((a) => a.status === "PENDING").length;

  // ── Date navigation ──────────────────────────────────────────────────────────

  const shiftDate = (days: number) => {
    setSelectedDate((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + days);
      return next;
    });
  };

  const viewingToday = isSameDay(selectedDate, today);

  // ── Time-gutter labels (every 30 min) ────────────────────────────────────────

  const timeRows = Array.from({ length: TOTAL_HOURS * 2 }, (_, i) => ({
    isHour:  i % 2 === 0,
    hour:    DAY_START + Math.floor(i / 2),
    minute:  (i % 2) * 30,
    top:     i * (HOUR_PX / 2),
  }));

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">

      {/* ── Top bar ── */}
      <header className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase text-gray-400">
              Dashboard
            </p>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              Calendar
            </h1>
          </div>

          {/* Date navigation */}
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftDate(-1)}
              className="w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-gray-900 min-w-[220px] text-center">
              {fmtHeader(selectedDate)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => shiftDate(1)}
              className="w-8 h-8 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            {!viewingToday && (
              <Button
                variant="ghost"
                onClick={() => setSelectedDate(today)}
                className="h-8 text-xs rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 ml-1"
              >
                Today
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Daily stats */}
          <div className="hidden sm:flex items-center gap-5 text-sm border-r border-gray-100 pr-5">
            <span className="text-gray-500">
              Total&nbsp;
              <span className="font-semibold text-gray-900">{appointments.length}</span>
            </span>
            <span className="text-gray-500">
              Confirmed&nbsp;
              <span className="font-semibold text-emerald-600">{confirmed}</span>
            </span>
            <span className="text-gray-500">
              Pending&nbsp;
              <span className="font-semibold text-sky-600">{pending}</span>
            </span>
          </div>

          {/* Live indicator */}
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 transition-colors",
              isLive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-400"
            )}
          >
            {isLive ? (
              <><Wifi className="w-3 h-3" /> Live</>
            ) : (
              <><WifiOff className="w-3 h-3" /> Offline</>
            )}
          </div>
        </div>
      </header>

      {/* ── Calendar grid ── */}
      <div className="flex-1 overflow-auto">
        <div className="inline-flex flex-col min-w-full">

          {/* Staff headers — sticky to top */}
          <div
            className="sticky top-0 z-20 flex bg-white border-b border-gray-100"
            style={{ paddingLeft: 64 }}
          >
            {STAFF_LIST.map((staff) => (
              <div
                key={staff.id}
                className="flex items-center gap-3 px-4 py-3 border-l border-gray-100"
                style={{ minWidth: COL_MIN_W, flex: "1 1 0" }}
              >
                <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                  {staff.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {staff.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{staff.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Body: time gutter + appointment columns */}
          <div className="flex">

            {/* Time gutter — sticky to left */}
            <div
              className="sticky left-0 z-10 bg-white border-r border-gray-100 shrink-0"
              style={{ width: 64, height: GRID_PX }}
            >
              {timeRows.map(({ isHour, hour, top }) =>
                isHour ? (
                  <span
                    key={top}
                    className="absolute right-3 text-[11px] font-medium text-gray-400 select-none"
                    style={{ top: top - 8 }}
                  >
                    {new Date(2000, 0, 1, hour).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      hour12: true,
                    })}
                  </span>
                ) : null
              )}
            </div>

            {/* Appointment area — all staff columns side by side */}
            <div className="relative flex flex-1">

              {/* Current-time indicator (shown only for today's view) */}
              {viewingToday && nowTop !== null && (
                <div
                  className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                  style={{ top: nowTop }}
                >
                  <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 -ml-1" />
                  <div className="flex-1 h-px bg-rose-400 opacity-70" />
                </div>
              )}

              {/* Staff columns */}
              {STAFF_LIST.map((staff) => {
                const staffAppts = appointments.filter(
                  (a) => a.staffId === staff.id
                );
                return (
                  <div
                    key={staff.id}
                    className="relative border-l border-gray-100"
                    style={{ minWidth: COL_MIN_W, flex: "1 1 0", height: GRID_PX }}
                  >
                    {/* Horizontal grid lines */}
                    {timeRows.map(({ isHour, top }) => (
                      <div
                        key={top}
                        className={cn(
                          "absolute left-0 right-0 border-t",
                          isHour ? "border-gray-200" : "border-gray-100"
                        )}
                        style={{ top }}
                      />
                    ))}

                    {/* Appointment blocks */}
                    {staffAppts.map((appt) => (
                      <ApptBlock key={appt.id} appt={appt} />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Realtime toast notifications ── */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-gray-900 text-white rounded-xl px-4 py-3 shadow-2xl max-w-xs animate-in slide-in-from-bottom-3 fade-in duration-200"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{toast.title}</p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">{toast.body}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 text-gray-500 hover:text-white transition-colors mt-px"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
