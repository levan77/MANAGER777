"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Users, Scissors, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard/calendar", label: "Calendar",  icon: CalendarDays },
  { href: "/dashboard/staff",    label: "Staff",      icon: Users },
  { href: "/dashboard/services", label: "Services",   icon: Scissors },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  const navItem = (href: string, label: string, Icon: React.ElementType) => {
    const active = pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          // Mobile: centre icon + label in a flex-1 cell
          "flex-1 justify-center sm:flex-none sm:justify-start",
          active
            ? "bg-gray-100 text-[#1F1F1F]"
            : "text-gray-500 hover:bg-gray-50 hover:text-[#1F1F1F]"
        )}
      >
        <Icon
          className="w-4 h-4 shrink-0"
          strokeWidth={active ? 2.25 : 1.75}
        />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
    // On mobile the parent flex container is flex-col, so this element
    // becomes a top bar (full-width, fixed height).
    // On sm+ the parent is flex-row, so this becomes a sidebar (fixed width, full height).
    <aside
      className={cn(
        "flex sm:flex-col shrink-0",
        "w-full sm:w-56",
        "h-14 sm:h-full",
        "border-b sm:border-b-0 sm:border-r border-gray-100",
        "bg-white"
      )}
    >
      {/* Logo */}
      <div className="flex items-center px-5 sm:px-5 sm:py-5 h-full sm:h-auto border-r sm:border-r-0 sm:border-b border-gray-100 shrink-0">
        <span className="text-xs font-bold tracking-[0.12em] uppercase text-[#1F1F1F]">
          MNGR
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex sm:flex-col flex-1 items-center sm:items-stretch px-3 sm:px-3 sm:py-4 gap-1 overflow-x-auto sm:overflow-visible">
        {NAV.map(({ href, label, icon: Icon }) => navItem(href, label, Icon))}
      </nav>

      {/* Bottom: salon info + sign-out (desktop only) */}
      <div className="hidden sm:flex flex-col border-t border-gray-100 px-5 py-4">
        <p className="text-xs font-semibold text-[#1F1F1F] truncate">Demo Salon</p>
        <p className="text-[11px] text-gray-400 mt-0.5 mb-3">Admin</p>
        <Link
          href="/login"
          className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#1F1F1F] transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </Link>
      </div>
    </aside>
  );
}
