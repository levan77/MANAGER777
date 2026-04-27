"use client";

import { use, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  description: string;
};

type StaffMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SERVICES: Service[] = [
  {
    id: "1",
    name: "Haircut & Style",
    duration: 45,
    price: 65,
    description: "Precision cut tailored to your face shape and hair texture.",
  },
  {
    id: "2",
    name: "Balayage",
    duration: 150,
    price: 180,
    description: "Hand-painted highlights for a seamless, natural gradient.",
  },
  {
    id: "3",
    name: "Deep Conditioning",
    duration: 30,
    price: 45,
    description: "Intensive moisture treatment for all hair types.",
  },
  {
    id: "4",
    name: "Blow Dry & Style",
    duration: 45,
    price: 55,
    description: "Professional blowout with lasting volume and hold.",
  },
  {
    id: "5",
    name: "Color Touch-Up",
    duration: 60,
    price: 85,
    description: "Root color refresh for a polished, seamless finish.",
  },
  {
    id: "6",
    name: "Keratin Treatment",
    duration: 120,
    price: 220,
    description: "Smooth, frizz-free results that last up to five months.",
  },
];

const STAFF: StaffMember[] = [
  {
    id: "any",
    name: "Any Available",
    role: "First available specialist",
    initials: "✦",
  },
  { id: "1", name: "Emma Rose", role: "Senior Stylist", initials: "ER" },
  { id: "2", name: "Marcus Chen", role: "Color Specialist", initials: "MC" },
  { id: "3", name: "Sofia Laurent", role: "Master Stylist", initials: "SL" },
  { id: "4", name: "Aria Kim", role: "Texture Expert", initials: "AK" },
];

const TIME_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
];

// Simulated booked slots for the demo
const BOOKED_SLOTS = new Set(["10:30 AM", "12:00 PM", "2:00 PM", "3:30 PM"]);

const STEPS = [
  { id: 1, label: "Service" },
  { id: 2, label: "Stylist" },
  { id: 3, label: "Schedule" },
];

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-start justify-center mb-12">
      {STEPS.map((step, idx) => {
        const isComplete = current > step.id;
        const isActive = current === step.id;

        return (
          <div key={step.id} className="flex items-start">
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                  isComplete || isActive
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-400",
                  isActive && "ring-4 ring-gray-900/10"
                )}
              >
                {isComplete ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={3} />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium tracking-wide",
                  isActive ? "text-gray-900" : isComplete ? "text-gray-500" : "text-gray-300"
                )}
              >
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-16 mx-2 mt-4 transition-all duration-300",
                  current > step.id ? "bg-gray-900" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
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

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const canAdvance =
    (step === 1 && selectedService !== null) ||
    (step === 2 && selectedStaff !== null) ||
    (step === 3 && selectedDate !== undefined && selectedTime !== null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const chosenService = SERVICES.find((s) => s.id === selectedService);
  const chosenStaff = STAFF.find((s) => s.id === selectedStaff);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 py-16 sm:px-8">

        {/* ── Page Header ── */}
        <div className="text-center mb-12">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-400 mb-3">
            {domain}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Book an Appointment
          </h1>
          <p className="mt-2.5 text-sm text-gray-500">
            Reserve your session in just a few steps.
          </p>
        </div>

        {/* ── Step Indicator ── */}
        <StepIndicator current={step} />

        {/* ── Step Content ── */}

        {/* Step 1 — Service */}
        {step === 1 && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Choose a service
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Select the treatment you&apos;d like to book.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SERVICES.map((service) => {
                const isSelected = selectedService === service.id;
                return (
                  <button
                    key={service.id}
                    onClick={() => setSelectedService(service.id)}
                    className={cn(
                      "relative w-full text-left p-5 rounded-2xl border transition-all duration-150",
                      isSelected
                        ? "border-gray-900 bg-gray-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-gray-900 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </span>
                    )}
                    <p className="font-semibold text-gray-900 text-sm pr-6">
                      {service.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1.5 mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Clock className="w-3 h-3" />
                        {service.duration} min
                      </span>
                      <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                      <span className="font-semibold text-gray-700">
                        ${service.price}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2 — Staff */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Choose a stylist
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Pick who you&apos;d like to work with.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STAFF.map((member) => {
                const isSelected = selectedStaff === member.id;
                const isAny = member.id === "any";

                return (
                  <button
                    key={member.id}
                    onClick={() => setSelectedStaff(member.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-3.5 p-5 rounded-2xl border transition-all duration-150",
                      isSelected
                        ? "border-gray-900 bg-gray-50 shadow-sm"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-sm bg-white"
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 w-4 h-4 rounded-full bg-gray-900 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </span>
                    )}

                    {/* Avatar */}
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm select-none",
                        isAny
                          ? "bg-gray-100 text-gray-400 text-base"
                          : "bg-gray-900 text-white"
                      )}
                    >
                      {member.initials}
                    </div>

                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">
                        {member.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                        {member.role}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3 — Date & Time */}
        {step === 3 && (
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Pick a date &amp; time
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                All times are shown in your local timezone.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Calendar */}
              <div className="shrink-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTime(null);
                  }}
                  disabled={(date) => date < today}
                  className="rounded-2xl border border-gray-200 p-3"
                />
              </div>

              {/* Time Slots */}
              <div className="flex-1 min-w-0">
                {selectedDate ? (
                  <>
                    <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-3">
                      Available Times
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
                                ? "border-gray-900 bg-gray-900 text-white"
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
                    <p className="text-sm text-gray-400">
                      Select a date to see times
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Booking Summary */}
            {chosenService && chosenStaff && selectedDate && selectedTime && (
              <div className="mt-8 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                <p className="text-[11px] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-4">
                  Booking Summary
                </p>
                <div className="space-y-2.5 text-sm">
                  {[
                    ["Service", chosenService.name],
                    ["Stylist", chosenStaff.name],
                    [
                      "Date",
                      selectedDate.toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "long",
                        day: "numeric",
                      }),
                    ],
                    ["Time", selectedTime],
                    ["Duration", `${chosenService.duration} min`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-gray-500">{label}</span>
                      <span className="text-gray-900 font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="pt-3 mt-1 border-t border-gray-200 flex justify-between font-semibold text-gray-900">
                    <span>Total</span>
                    <span>${chosenService.price}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Navigation ── */}
        <div
          className={cn(
            "flex mt-10",
            step > 1 ? "justify-between" : "justify-end"
          )}
        >
          {step > 1 && (
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl px-5"
            >
              Back
            </Button>
          )}

          {step < STEPS.length ? (
            <Button
              disabled={!canAdvance}
              onClick={() => setStep((s) => s + 1)}
              className="bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl px-8 font-medium transition-all"
            >
              Continue
            </Button>
          ) : (
            <Button
              disabled={!canAdvance}
              className="bg-gray-900 hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-xl px-8 font-medium transition-all"
            >
              Confirm Booking
            </Button>
          )}
        </div>

      </div>
    </div>
  );
}
