"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, Clock } from "lucide-react";
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

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price: number;
};

const INITIAL_SERVICES: Service[] = [
  { id: "1", name: "Haircut & Style",     duration_minutes: 45,  price: 65  },
  { id: "2", name: "Balayage",            duration_minutes: 150, price: 180 },
  { id: "3", name: "Deep Conditioning",   duration_minutes: 30,  price: 45  },
  { id: "4", name: "Blow Dry & Style",    duration_minutes: 45,  price: 55  },
  { id: "5", name: "Color Touch-Up",      duration_minutes: 60,  price: 85  },
  { id: "6", name: "Keratin Treatment",   duration_minutes: 120, price: 220 },
];

function fmtDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
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

// ─── Empty form state ─────────────────────────────────────────────────────────

const EMPTY = { name: "", duration_minutes: "", price: "" };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  const [services, setServices]       = useState<Service[]>(INITIAL_SERVICES);
  const [dialogOpen, setDialogOpen]   = useState(false);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [confirmId, setConfirmId]     = useState<string | null>(null);
  const [form, setForm]               = useState(EMPTY);
  const [errors, setErrors]           = useState<Record<string, string>>({});

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY);
    setErrors({});
    setDialogOpen(true);
  }

  function openEdit(svc: Service) {
    setEditingId(svc.id);
    setForm({
      name: svc.name,
      duration_minutes: String(svc.duration_minutes),
      price: String(svc.price),
    });
    setErrors({});
    setDialogOpen(true);
  }

  function setField(key: keyof typeof EMPTY, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => { const next = { ...e }; delete next[key]; return next; });
  }

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    if (!form.name.trim())                       errs.name             = "Name is required.";
    const dur = Number(form.duration_minutes);
    if (!form.duration_minutes || isNaN(dur) || dur <= 0)
                                                 errs.duration_minutes = "Enter a valid duration (minutes).";
    const price = Number(form.price);
    if (!form.price || isNaN(price) || price < 0) errs.price           = "Enter a valid price.";
    return errs;
  }

  function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const entry: Service = {
      id: editingId ?? crypto.randomUUID(),
      name: form.name.trim(),
      duration_minutes: Number(form.duration_minutes),
      price: Number(Number(form.price).toFixed(2)),
    };

    setServices((prev) =>
      editingId
        ? prev.map((s) => (s.id === editingId ? entry : s))
        : [...prev, entry]
    );
    setDialogOpen(false);
  }

  function handleRemove(id: string) {
    setServices((prev) => prev.filter((s) => s.id !== id));
    setConfirmId(null);
  }

  const dialogTitle = editingId ? "Edit service" : "Add a service";

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
              Services
            </h1>
          </div>
          <Button
            onClick={openAdd}
            className="bg-[#1F1F1F] hover:bg-[#333] text-white rounded-xl gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add service
          </Button>
        </div>

        {/* Services list */}
        {services.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-400">No services yet.</p>
            <button
              onClick={openAdd}
              className="mt-2 text-sm font-medium text-[#1F1F1F] hover:underline underline-offset-2"
            >
              Add your first service →
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-100">
            {services.map((svc) => (
              <div
                key={svc.id}
                className="flex items-center gap-4 px-5 py-4 bg-white group"
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1F1F1F] truncate">
                    {svc.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {fmtDuration(svc.duration_minutes)}
                    </span>
                  </div>
                </div>

                {/* Price */}
                <span className="text-sm font-semibold text-[#1F1F1F] tabular-nums shrink-0">
                  ${svc.price.toFixed(2)}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {confirmId === svc.id ? (
                    <>
                      <button
                        onClick={() => setConfirmId(null)}
                        className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleRemove(svc.id)}
                        className="rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-600 transition-colors"
                      >
                        Confirm
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => openEdit(svc)}
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-gray-400 hover:text-[#1F1F1F] transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Edit service"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setConfirmId(svc.id); }}
                        className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:border-red-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Remove service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium text-[#1F1F1F] mb-1.5">
                Service name
              </label>
              <Input
                placeholder="e.g. Balayage"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                autoFocus
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Duration + Price side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#1F1F1F] mb-1.5">
                  Duration (minutes)
                </label>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  placeholder="45"
                  value={form.duration_minutes}
                  onChange={(e) => setField("duration_minutes", e.target.value)}
                />
                {errors.duration_minutes && (
                  <p className="mt-1 text-xs text-red-500">{errors.duration_minutes}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#1F1F1F] mb-1.5">
                  Price ($)
                </label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="65.00"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-red-500">{errors.price}</p>
                )}
              </div>
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
              onClick={handleSave}
              className="bg-[#1F1F1F] hover:bg-[#333] text-white rounded-xl"
            >
              {editingId ? "Save changes" : "Add service"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
