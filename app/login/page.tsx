"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [errors, setErrors]             = useState<Record<string, string>>({});

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!email.trim())                    errs.email    = "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email))     errs.email    = "Enter a valid email address.";
    if (!password)                        errs.password = "Password is required.";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    // Replace with real Supabase auth call.
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    window.location.href = "/dashboard/calendar";
  }

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
            href="/register"
            className="text-sm text-gray-500 hover:text-[#1F1F1F] transition-colors"
          >
            Create account
          </Link>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-md mx-auto px-6 pt-16 pb-24">

        <div className="mb-10">
          <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-400 mb-3">
            Welcome back
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#1F1F1F]">
            Sign in to your salon
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Enter your credentials to access your dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#1F1F1F] mb-1.5">
              Email
            </label>
            <input
              type="email"
              placeholder="jane@yoursalon.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors({}); }}
              autoComplete="email"
              autoFocus
              className={cn(
                "w-full rounded-xl border px-4 py-3 text-sm text-[#1F1F1F]",
                "placeholder:text-gray-300 bg-white",
                "focus:outline-none focus:ring-2 focus:ring-[#1F1F1F]/10 focus:border-gray-400",
                "transition-colors",
                errors.email ? "border-red-300" : "border-gray-200"
              )}
            />
            {errors.email && (
              <p className="mt-1.5 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-[#1F1F1F]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-gray-400 hover:text-[#1F1F1F] transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({}); }}
                autoComplete="current-password"
                className={cn(
                  "w-full rounded-xl border px-4 py-3 pr-11 text-sm text-[#1F1F1F]",
                  "placeholder:text-gray-300 bg-white",
                  "focus:outline-none focus:ring-2 focus:ring-[#1F1F1F]/10 focus:border-gray-400",
                  "transition-colors",
                  errors.password ? "border-red-300" : "border-gray-200"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword
                  ? <EyeOff className="w-4 h-4" />
                  : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs text-red-500">{errors.password}</p>
            )}
          </div>

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
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </div>

        </form>

        <div className="mt-10 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-[#1F1F1F] hover:underline underline-offset-2"
            >
              Create a salon account
            </Link>
          </p>
        </div>

      </main>
    </div>
  );
}
