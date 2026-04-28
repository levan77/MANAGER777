import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fmtDuration(mins: number, minLabel = "min"): string {
  if (mins < 60) return `${mins} ${minLabel}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m} ${minLabel}` : `${h}h`;
}
