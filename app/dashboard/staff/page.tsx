"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, CalendarDays } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types & mock data ────────────────────────────────────────────────────────

type StaffMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
};

const INITIAL_STAFF: StaffMember[] = [
  { id: "1", name: "Emma Rose",     role: "Senior Stylist",   initials: "ER" },
  { id: "2", name: "Marcus Chen",   role: "Color Specialist", initials: "MC" },
  { id: "3", name: "Sofia Laurent", role: "Master Stylist",   initials: "SL" },
  { id: "4", name: "Aria Kim",      role: "Texture Expert",   initials: "AK" },
];

function makeInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Input ────────────────────────────────────────────────────────────────────

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const [staff, setStaff]             = useState<StaffMember[]>(INITIAL_STAFF);
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [confirmId, setConfirmId]     = useState<string | null>(null);
  const [name, setName]               = useState("");
  const [role, setRole]               = useState("");
  const [errors, setErrors]           = useState<Record<string, string>>({});

  function handleAdd() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required.";
    if (!role.trim()) errs.role = "Role is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStaff((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: name.trim(), role: role.trim(), initials: makeInitials(name) },
    ]);
    setName("");
    setRole("");
    setErrors({});
    setDialogOpen(false);
  }

  function handleRemove(id: string) {
    setStaff((prev) => prev.filter((s) => s.id !== id));
    setConfirmId(null);
  }

  return (
    <div className="h-full overflow-auto bg-white">
      <div className="max-w-3xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-gray-400 mb-1">
              Management
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[#1F1F1F]">
              Staff
            </h1>
          </div>
          <Button
            onClick={() => { setErrors({}); setName(""); setRole(""); setDialogOpen(true); }}
            className="bg-[#1F1F1F] hover:bg-[#333] text-white rounded-xl gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add staff
          </Button>
        </div>

        {/* Staff grid */}
        {staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400">No staff members yet.</p>
            <button
              onClick={() => setDialogOpen(true)}
              className="mt-2 text-sm font-medium text-[#1F1F1F] hover:underline underline-offset-2"
            >
              Add your first team member →
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 group"
              >
                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#1F1F1F] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    {member.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1F1F1F] truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{member.role}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-100">
                  <Link
                    href={`/dashboard/staff/${member.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:border-gray-400 hover:text-[#1F1F1F] transition-colors"
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    Schedule
                  </Link>

                  {confirmId === member.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRemove(member.id)}
                        className="rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white hover:bg-red-600 transition-colors"
                      >
                        Confirm
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmId(member.id)}
                      className="rounded-lg border border-gray-200 p-2 text-gray-400 hover:border-red-200 hover:text-red-400 transition-colors"
                      aria-label="Remove staff member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add staff dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Add a team member</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div>
              <label className="block text-xs font-medium text-[#1F1F1F] mb-1.5">
                Full name
              </label>
              <Input
                placeholder="Emma Rose"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors({}); }}
                autoFocus
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#1F1F1F] mb-1.5">
                Role / title
              </label>
              <Input
                placeholder="e.g. Senior Stylist, Color Specialist"
                value={role}
                onChange={(e) => { setRole(e.target.value); setErrors({}); }}
              />
              {errors.role && (
                <p className="mt-1 text-xs text-red-500">{errors.role}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              className="text-gray-500"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              className="bg-[#1F1F1F] hover:bg-[#333] text-white rounded-xl"
            >
              Add member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
