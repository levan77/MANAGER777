"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Field component ──────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F1F1F] mb-1.5">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1.5 text-xs text-gray-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#1F1F1F]",
        "placeholder:text-gray-300",
        "focus:outline-none focus:ring-2 focus:ring-[#1F1F1F]/10 focus:border-gray-400",
        "disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed",
        "transition-colors",
        className
      )}
      {...props}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [salonName, setSalonName]     = useState("");
  const [slug, setSlug]               = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const [loading, setLoading]         = useState(false);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  // Auto-generate slug from salon name unless the user has edited it manually.
  function handleSalonNameChange(value: string) {
    setSalonName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(slugify(value));
  }

  // ── Validation ───────────────────────────────────────────────────────────────

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!salonName.trim())      errs.salonName = "Salon name is required.";
    if (!slug)                  errs.slug      = "URL slug is required.";
    if (slug.length < 3)        errs.slug      = "Slug must be at least 3 characters.";
    if (!email.trim())          errs.email     = "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email address.";
    if (!password)              errs.password  = "Password is required.";
    if (password.length < 8)   errs.password  = "Password must be at least 8 characters.";
    return errs;
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    // Simulate network request — replace with real API call.
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  }

  // ── Success state ─────────────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-full bg-[#1F1F1F] flex items-center justify-center mx-auto mb-6">
            <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-semibold text-[#1F1F1F] tracking-tight mb-3">
            Salon created
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            <span className="font-medium text-[#1F1F1F]">{salonName}</span> is
            ready. Check your inbox to verify your email and access your
            dashboard.
          </p>
          <Link
            href="/dashboard/calendar"
            className="inline-flex items-center justify-center w-full rounded-xl bg-[#1F1F1F] px-6 py-3 text-sm font-semibold text-white hover:bg-[#333] transition-colors"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Password strength ─────────────────────────────────────────────────────────

  const strength =
    password.length === 0 ? 0
    : password.length < 8  ? 1
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3
    : 2;

  const strengthLabel = ["", "Weak", "Fair", "Strong"][strength];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-emerald-400"][strength];

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <header className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#1F1F1F] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>
          <span className="text-sm font-bold tracking-[0.12em] uppercase text-[#1F1F1F]">
            MNGR
          </span>
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-[#1F1F1F] transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-md mx-auto px-6 pt-16 pb-24">

        <div className="mb-10">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-400 mb-3">
            Get started free
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1F1F1F]">
            Create your salon account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Set up takes under two minutes. No credit card required.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Salon name */}
          <Field
            label="Salon name"
            error={errors.salonName}
          >
            <Input
              type="text"
              placeholder="Nails by Jane"
              value={salonName}
              onChange={(e) => handleSalonNameChange(e.target.value)}
              autoComplete="organization"
              autoFocus
            />
          </Field>

          {/* Slug */}
          <Field
            label="Booking URL"
            hint={slug ? `Clients will book at ${slug}.mngr.app` : undefined}
            error={errors.slug}
          >
            <div className="flex items-center rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-[#1F1F1F]/10 focus-within:border-gray-400 transition-colors overflow-hidden">
              <span className="pl-4 pr-2 text-sm text-gray-400 select-none shrink-0 border-r border-gray-200 bg-gray-50 self-stretch flex items-center">
                mngr.app/
              </span>
              <input
                type="text"
                placeholder="nails-by-jane"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                className="flex-1 px-3 py-3 text-sm text-[#1F1F1F] placeholder:text-gray-300 focus:outline-none bg-white"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </Field>

          {/* Divider */}
          <div className="pt-1 pb-1 border-t border-gray-100" />

          {/* Email */}
          <Field label="Work email" error={errors.email}>
            <Input
              type="email"
              placeholder="jane@yoursalon.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>

          {/* Password */}
          <Field label="Password" error={errors.password}>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />
                }
              </button>
            </div>

            {/* Strength meter */}
            {password.length > 0 && (
              <div className="mt-2.5 flex items-center gap-3">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors duration-300",
                        strength >= level ? strengthColor : "bg-gray-100"
                      )}
                    />
                  ))}
                </div>
                <span className="text-[11px] font-medium text-gray-400 w-10 text-right">
                  {strengthLabel}
                </span>
              </div>
            )}
          </Field>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={cn(
                "w-full rounded-xl bg-[#1F1F1F] px-6 py-3.5 text-sm font-semibold text-white",
                "hover:bg-[#333] transition-colors",
                "disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-white animate-spin" />
                  Creating account…
                </>
              ) : (
                "Create Salon Account"
              )}
            </button>
          </div>

          <p className="text-center text-xs text-gray-400">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-[#1F1F1F] transition-colors">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-[#1F1F1F] transition-colors">
              Privacy Policy
            </Link>
            .
          </p>

        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[#1F1F1F] hover:underline underline-offset-2"
            >
              Sign in
            </Link>
          </p>
        </div>

      </main>
    </div>
  );
}
