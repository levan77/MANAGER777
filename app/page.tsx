import Link from "next/link";
import {
  CalendarDays,
  Globe,
  Clock,
  Users,
  Zap,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: CalendarDays,
    title: "Staff-column calendar",
    description:
      "See every stylist's day side by side. Appointments, gaps, and overlaps read at a glance — no hunting through a list.",
  },
  {
    icon: Globe,
    title: "Custom booking domain",
    description:
      "Each salon gets its own white-label booking page at a custom domain. Your brand on every touchpoint, not ours.",
  },
  {
    icon: Clock,
    title: "Intelligent scheduling",
    description:
      "Working hours, lunch breaks, and time-off are enforced automatically. The engine never offers a slot that doesn't exist.",
  },
  {
    icon: Users,
    title: "Full staff management",
    description:
      "Set individual schedules, assign services, and track each stylist's calendar separately — all inside one admin view.",
  },
  {
    icon: Zap,
    title: "Real-time updates",
    description:
      "New bookings flash onto the admin calendar the instant they arrive via Supabase Realtime. No refresh ever needed.",
  },
  {
    icon: ShieldCheck,
    title: "Built-in multi-tenancy",
    description:
      "Row-level security isolates every salon's data at the database. Compliance and privacy without extra configuration.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Create your salon account",
    description:
      "Register in under two minutes. Add your salon's name, slug, and a custom domain if you have one.",
  },
  {
    number: "02",
    title: "Add staff, services, and hours",
    description:
      "Configure each stylist's weekly schedule, set their services and pricing, and block out breaks.",
  },
  {
    number: "03",
    title: "Share your booking link",
    description:
      "Clients book directly from your branded page. Appointments appear on your admin calendar instantly.",
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-[#1F1F1F]">

      {/* ══════════════════════════════════════════
          NAV
      ══════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16">
          <span className="text-sm font-bold tracking-[0.12em] uppercase text-[#1F1F1F]">
            MNGR
          </span>

          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-gray-500 hover:text-[#1F1F1F] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#1F1F1F] px-4 py-2 text-sm font-medium text-white hover:bg-[#333] transition-colors"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </nav>
      </header>

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 pt-24 pb-28 sm:pt-32 sm:pb-36">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

          {/* Left — copy */}
          <div>
            <p className="inline-block text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-400 mb-7">
              Scheduling software for modern salons
            </p>

            <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.08] text-[#1F1F1F] mb-6">
              Every stylist.
              <br />
              Every appointment.
              <br />
              One clean calendar.
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-md">
              Manage staff schedules, take online bookings, and give every
              stylist their own real-time calendar — all from a single,
              beautifully simple platform.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#1F1F1F] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#333] transition-colors"
              >
                Create Salon Account
              </Link>
              <p className="text-xs text-gray-400">
                No credit card required
              </p>
            </div>
          </div>

          {/* Right — calendar preview (desktop only) */}
          <div className="relative hidden lg:block">
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">

              {/* Calendar header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <span className="text-[11px] font-semibold text-gray-700">
                  Monday, 27 April
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>

              {/* Staff headers */}
              <div className="flex border-b border-gray-100">
                <div className="w-14 shrink-0" />
                {[
                  { name: "Emma R.", initials: "ER" },
                  { name: "Marcus C.", initials: "MC" },
                  { name: "Sofia L.", initials: "SL" },
                ].map((s) => (
                  <div
                    key={s.name}
                    className="flex-1 flex items-center gap-2 px-3 py-3 border-l border-gray-100"
                  >
                    <div className="w-6 h-6 rounded-full bg-[#1F1F1F] text-white text-[9px] font-semibold flex items-center justify-center shrink-0">
                      {s.initials}
                    </div>
                    <p className="text-[10px] font-semibold text-gray-800 truncate">
                      {s.name}
                    </p>
                  </div>
                ))}
              </div>

              {/* Appointment grid */}
              <div className="flex" style={{ height: 230 }}>
                {/* Time gutter */}
                <div className="w-14 shrink-0 relative">
                  {["9 AM", "10", "11", "12"].map((t, i) => (
                    <div
                      key={t}
                      className="absolute left-0 right-0 pl-3 text-[9px] text-gray-400"
                      style={{ top: i * 57 + 6 }}
                    >
                      {t}
                    </div>
                  ))}
                </div>

                {/* Emma */}
                <div className="flex-1 border-l border-gray-100 relative">
                  <div
                    className="absolute inset-x-1 rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1.5"
                    style={{ top: 14, height: 52 }}
                  >
                    <p className="text-[10px] font-semibold text-emerald-900 leading-tight">
                      Jade Morris
                    </p>
                    <p className="text-[9px] text-emerald-700 mt-0.5 leading-tight">
                      Haircut &amp; Style
                    </p>
                  </div>
                  <div
                    className="absolute inset-x-1 rounded-lg bg-sky-50 border border-sky-200 px-2 py-1.5"
                    style={{ top: 114, height: 80 }}
                  >
                    <p className="text-[10px] font-semibold text-sky-900 leading-tight">
                      Priya Kapoor
                    </p>
                    <p className="text-[9px] text-sky-700 mt-0.5 leading-tight">
                      Balayage
                    </p>
                  </div>
                </div>

                {/* Marcus */}
                <div className="flex-1 border-l border-gray-100 relative">
                  <div
                    className="absolute inset-x-1 rounded-t-none rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-1.5"
                    style={{ top: 0, height: 100 }}
                  >
                    <p className="text-[10px] font-semibold text-emerald-900 leading-tight">
                      Diana Osei
                    </p>
                    <p className="text-[9px] text-emerald-700 mt-0.5 leading-tight">
                      Balayage
                    </p>
                  </div>
                  <div
                    className="absolute inset-x-1 rounded-lg bg-gray-100 border border-gray-200 px-2 py-1.5"
                    style={{ top: 114, height: 30 }}
                  >
                    <p className="text-[9px] text-gray-400 font-medium">
                      Lunch break
                    </p>
                  </div>
                </div>

                {/* Sofia */}
                <div className="flex-1 border-l border-gray-100 relative">
                  <div
                    className="absolute inset-x-1 rounded-lg bg-sky-50 border border-sky-200 px-2 py-1.5"
                    style={{ top: 16, height: 112 }}
                  >
                    <p className="text-[10px] font-semibold text-sky-900 leading-tight">
                      Sarah Mitchell
                    </p>
                    <p className="text-[9px] text-sky-700 mt-0.5 leading-tight">
                      Keratin Treatment
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating toast */}
            <div className="absolute -bottom-5 -left-5 bg-[#1F1F1F] text-white rounded-xl px-4 py-3 max-w-[196px]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <p className="text-[10px] font-semibold">New booking</p>
              </div>
              <p className="text-[10px] text-gray-400 leading-snug">
                Jade M. — 9:30 AM · Online
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STATS STRIP
      ══════════════════════════════════════════ */}
      <div className="border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">
            {[
              { value: "15-min", label: "Scheduling precision" },
              { value: "White-label", label: "Every booking page" },
              { value: "Real-time", label: "Calendar sync" },
            ].map((stat) => (
              <div key={stat.value} className="px-0 sm:px-10 py-10 first:pl-0 last:pr-0">
                <p className="text-2xl font-semibold text-[#1F1F1F] tracking-tight">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-28 sm:py-36">
        <div className="max-w-xl mb-16">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-400 mb-4">
            Why salons choose MNGR
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] text-[#1F1F1F]">
            Everything your salon
            <br />
            needs. Nothing it doesn&apos;t.
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-14">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="border-t border-gray-200 pt-8">
                <div className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center mb-5">
                  <Icon className="w-4 h-4 text-[#1F1F1F]" strokeWidth={1.75} />
                </div>
                <h3 className="text-base font-semibold text-[#1F1F1F] mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-28 sm:py-36">
          <div className="max-w-xl mb-16">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-400 mb-4">
              How it works
            </p>
            <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] text-[#1F1F1F]">
              Up and running
              <br />
              in minutes.
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-10">
            {STEPS.map((step, i) => (
              <div key={step.number} className="relative">
                {/* Connector line (not on last item) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-[calc(50%+24px)] right-0 h-px bg-gray-200" />
                )}
                <p className="text-xs font-semibold tracking-widest text-gray-300 mb-5">
                  {step.number}
                </p>
                <h3 className="text-base font-semibold text-[#1F1F1F] mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          BOTTOM CTA
      ══════════════════════════════════════════ */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-32 sm:py-40">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-400 mb-5">
            Get started today
          </p>
          <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight leading-[1.1] text-[#1F1F1F] mb-6">
            Ready to bring your salon
            <br />
            into the modern era?
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-md">
            Create your account in two minutes and have your first stylist
            taking online bookings before the end of the day.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1F1F1F] px-7 py-3.5 text-sm font-semibold text-white hover:bg-[#333] transition-colors"
            >
              Create Salon Account
            </Link>
            <p className="text-xs text-gray-400">No credit card required</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <span className="text-sm font-bold tracking-[0.12em] uppercase text-[#1F1F1F]">
            MNGR
          </span>

          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link href="/privacy" className="hover:text-[#1F1F1F] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#1F1F1F] transition-colors">
              Terms
            </Link>
            <Link href="/support" className="hover:text-[#1F1F1F] transition-colors">
              Support
            </Link>
          </div>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} MNGR. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
