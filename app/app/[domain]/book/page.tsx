"use client";

import { use, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Check, Clock, ChevronDown } from "lucide-react";
import { cn, fmtDuration } from "@/lib/utils";
import { SERVICES, STAFF } from "@/lib/mock-data";
import { TRANSLATIONS, LANG_LOCALE, type Lang } from "@/lib/i18n";

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const TIME_SLOTS = [
  "9:00", "9:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

const BOOKED_SLOTS = new Set(["10:30", "12:00", "14:00", "15:30"]);

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({
  current,
  labels,
}: {
  current: number;
  labels: [string, string, string];
}) {
  const steps = [
    { id: 1, label: labels[0] },
    { id: 2, label: labels[1] },
    { id: 3, label: labels[2] },
  ];

  return (
    <div className="flex items-start justify-center mb-10">
      {steps.map((step, idx) => {
        const isComplete = current > step.id;
        const isActive = current === step.id;
        return (
          <div key={step.id} className="flex items-start">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300",
                  isComplete || isActive
                    ? "bg-[#1F1F1F] text-white"
                    : "bg-gray-100 text-gray-400",
                  isActive && "ring-4 ring-[#1F1F1F]/10"
                )}
              >
                {isComplete ? <Check className="w-3 h-3" strokeWidth={3} /> : step.id}
              </div>
              <span
                className={cn(
                  "text-[11px] font-medium tracking-wide",
                  isActive ? "text-[#1F1F1F]" : isComplete ? "text-gray-500" : "text-gray-300"
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-12 sm:w-16 mx-2 mt-3.5 transition-all duration-300",
                  current > step.id ? "bg-[#1F1F1F]" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Language Toggle ──────────────────────────────────────────────────────────

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 p-0.5">
      {(["ka", "ru"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide transition-colors",
            lang === l
              ? "bg-[#1F1F1F] text-white"
              : "text-gray-400 hover:text-[#1F1F1F]"
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BookPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = use(params);

  const [lang, setLang] = useState<Lang>("ka");
  const t = TRANSLATIONS[lang];

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff]     = useState<string | null>(null);
  const [selectedDate, setSelectedDate]       = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime]       = useState<string | null>(null);
  const [showEligible, setShowEligible]       = useState(false);

  const chosenService = SERVICES.find((s) => s.id === selectedService);
  const chosenStaff   = selectedStaff === "any"
    ? { name: t.anyAvailable }
    : STAFF.find((s) => s.id === selectedStaff);

  // Staff who can perform the selected service
  const eligibleStaff = selectedService
    ? STAFF.filter((s) => s.serviceIds.includes(selectedService))
    : STAFF;

  const canAdvance =
    (step === 1 && selectedService !== null) ||
    (step === 2 && selectedStaff !== null) ||
    (step === 3 && selectedDate !== undefined && selectedTime !== null);

  function handleServiceSelect(id: string) {
    setSelectedService(id);
    // Reset staff if no longer eligible
    if (selectedStaff && selectedStaff !== "any") {
      const still = STAFF.find((s) => s.id === selectedStaff);
      if (still && !still.serviceIds.includes(id)) setSelectedStaff(null);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 py-12 sm:py-16 sm:px-8">

        {/* ── Page Header ── */}
        <div className="flex items-start justify-between mb-10">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-400 mb-2">
              {domain}
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1F1F1F]">
              {t.bookAppointment}
            </h1>
            <p className="mt-1.5 text-sm text-gray-500">{t.reserveSteps}</p>
          </div>
          <LangToggle lang={lang} setLang={setLang} />
        </div>

        {/* ── Step Indicator ── */}
        <StepIndicator
          current={step}
          labels={[t.stepService, t.stepStylist, t.stepSchedule]}
        />

        {/* ── Step 1 — Service ── */}
        {step === 1 && (
          <div>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-[#1F1F1F]">{t.chooseService}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{t.chooseServiceSub}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICES.map((service) => {
                const isSelected = selectedService === service.id;
                return (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service.id)}
                    className={cn(
                      "relative w-full text-left p-5 rounded-2xl border transition-all duration-150",
                      isSelected
                        ? "border-[#1F1F1F] bg-gray-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-[#1F1F1F] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </span>
                    )}
                    <p className="font-semibold text-[#1F1F1F] text-sm pr-6">{service.name}</p>
                    <p className="text-xs text-gray-500 mt-1.5 mb-4 leading-relaxed">{service.description}</p>
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3" />
                        {fmtDuration(service.duration, t.min)}
                      </span>
                      <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                      <span className="font-semibold text-[#1F1F1F]">${service.price}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 2 — Stylist ── */}
        {step === 2 && (
          <div>
            {/* Selected service pill */}
            {chosenService && (
              <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-xl bg-gray-50 border border-gray-100 w-fit text-xs text-gray-500">
                <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                <span className="font-medium text-[#1F1F1F]">{chosenService.name}</span>
                <span className="text-gray-400">·</span>
                <span>{fmtDuration(chosenService.duration, t.min)}</span>
                <span className="text-gray-400">·</span>
                <span className="font-semibold text-[#1F1F1F]">${chosenService.price}</span>
              </div>
            )}

            <div className="mb-5">
              <h2 className="text-base font-semibold text-[#1F1F1F]">{t.chooseStylist}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{t.chooseStylistSub}</p>
            </div>

            {/* "Any Available" card */}
            <div className="mb-3">
              <button
                onClick={() => { setSelectedStaff("any"); setShowEligible(false); }}
                className={cn(
                  "w-full text-left rounded-2xl border px-4 py-3.5 transition-all duration-150",
                  selectedStaff === "any"
                    ? "border-[#1F1F1F] bg-gray-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-base select-none shrink-0">
                    ✦
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1F1F1F]">{t.anyAvailable}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.anyAvailableRole}</p>
                  </div>
                  {selectedStaff === "any" && (
                    <span className="w-5 h-5 rounded-full bg-[#1F1F1F] flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </span>
                  )}
                </div>
              </button>

              {/* Eligible stylists panel */}
              {selectedStaff === "any" && eligibleStaff.length > 0 && (
                <div className="mt-2 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden">
                  <button
                    onClick={() => setShowEligible((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-gray-500 hover:text-[#1F1F1F] transition-colors"
                  >
                    <span>
                      {t.availableFor}{" "}
                      <span className="font-semibold text-[#1F1F1F]">{eligibleStaff.length}</span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform duration-200",
                        showEligible && "rotate-180"
                      )}
                    />
                  </button>
                  {showEligible && (
                    <div className="px-4 pb-3 flex flex-wrap gap-2">
                      {eligibleStaff.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-2 rounded-lg bg-white border border-gray-200 px-2.5 py-1.5"
                        >
                          <div className="w-6 h-6 rounded-full bg-[#1F1F1F] text-white flex items-center justify-center text-[10px] font-semibold shrink-0">
                            {member.initials}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-[#1F1F1F] leading-none">{member.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5 leading-none">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Eligible specific stylists */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
              {eligibleStaff.map((member) => {
                const isSelected = selectedStaff === member.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => { setSelectedStaff(member.id); setShowEligible(false); }}
                    className={cn(
                      "relative flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all duration-150",
                      isSelected
                        ? "border-[#1F1F1F] bg-gray-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-[#1F1F1F] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </span>
                    )}
                    <div className="w-10 h-10 rounded-full bg-[#1F1F1F] text-white flex items-center justify-center text-xs font-semibold select-none">
                      {member.initials}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-[#1F1F1F] leading-snug">{member.name}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{member.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Step 3 — Date & Time ── */}
        {step === 3 && (
          <div>
            <div className="mb-5">
              <h2 className="text-base font-semibold text-[#1F1F1F]">{t.pickDateTime}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{t.pickDateTimeSub}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Calendar */}
              <div className="shrink-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => { setSelectedDate(date); setSelectedTime(null); }}
                  disabled={(date) => date < TODAY}
                  className="rounded-2xl border border-gray-200 p-3"
                />
              </div>

              {/* Time Slots */}
              <div className="flex-1 min-w-0">
                {selectedDate ? (
                  <>
                    <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-3">
                      {t.availableTimes}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const booked = BOOKED_SLOTS.has(slot);
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            disabled={booked}
                            onClick={() => setSelectedTime(slot)}
                            className={cn(
                              "py-2.5 text-sm rounded-xl border font-medium transition-all duration-150",
                              booked
                                ? "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed"
                                : isSelected
                                ? "border-[#1F1F1F] bg-[#1F1F1F] text-white"
                                : "border-gray-200 text-gray-700 hover:border-gray-400 bg-white"
                            )}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[180px] rounded-2xl border border-dashed border-gray-200">
                    <p className="text-sm text-gray-400">{t.selectDateFirst}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Summary */}
            {chosenService && chosenStaff && selectedDate && selectedTime && (
              <div className="mt-8 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-4">
                  {t.bookingSummary}
                </p>
                <div className="space-y-2.5 text-sm">
                  {[
                    [t.labelService,  chosenService.name],
                    [t.labelStylist,  chosenStaff.name],
                    [
                      t.labelDate,
                      selectedDate.toLocaleDateString(LANG_LOCALE[lang], {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                      }),
                    ],
                    [t.labelTime,     selectedTime],
                    [t.labelDuration, fmtDuration(chosenService.duration, t.min)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-500">{label}</span>
                      <span className="text-[#1F1F1F] font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="pt-3 mt-1 border-t border-gray-200 flex justify-between font-semibold text-[#1F1F1F]">
                    <span>{t.labelTotal}</span>
                    <span>${chosenService.price}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ── */}
        <div className={cn("flex mt-10", step > 1 ? "justify-between" : "justify-end")}>
          {step > 1 && (
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              className="text-gray-500 hover:text-[#1F1F1F] hover:bg-gray-100 rounded-xl px-5"
            >
              {t.back}
            </Button>
          )}

          {step < 3 ? (
            <Button
              disabled={!canAdvance}
              onClick={() => setStep((s) => s + 1)}
              className="bg-[#1F1F1F] hover:bg-[#333] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl px-8 font-medium transition-all"
            >
              {t.continue}
            </Button>
          ) : (
            <Button
              disabled={!canAdvance}
              className="bg-[#1F1F1F] hover:bg-[#333] disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl px-8 font-medium transition-all"
            >
              {t.confirmBooking}
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
