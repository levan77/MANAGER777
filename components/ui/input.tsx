import { cn } from "@/lib/utils";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#1F1F1F]",
        "placeholder:text-gray-300",
        "focus:outline-none focus:ring-2 focus:ring-[#1F1F1F]/10 focus:border-gray-400",
        "transition-colors"
      )}
      {...props}
    />
  );
}
