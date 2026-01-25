"use client";

import { useMemo, useState } from "react";

const tenants = ["tenant_1", "tenant_2"]; 

interface Booking {
  id: string;
  customerName: string;
  startAt: string;
  endAt: string;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
}

export default function DashboardClient() {
  const [tenantId, setTenantId] = useState(tenants[0]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formState, setFormState] = useState({
    serviceId: "",
    startAt: "",
    endAt: "",
    customerName: ""
  });

  const formErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!formState.serviceId.trim()) errors.serviceId = "Vyplňte službu.";
    if (!formState.startAt) errors.startAt = "Vyberte začiatok.";
    if (!formState.endAt) errors.endAt = "Vyberte koniec.";
    if (!formState.customerName.trim()) errors.customerName = "Zadajte meno klienta.";
    return errors;
  }, [formState]);

  const submitDisabled = Object.keys(formErrors).length > 0 || loading;

  const createBooking = async () => {
    setLoading(true);
    setError(null);
    try {
      const newBooking: Booking = {
        id: `local_${Math.random().toString(36).slice(2)}`,
        customerName: formState.customerName,
        startAt: formState.startAt,
        endAt: formState.endAt,
        status: "CONFIRMED"
      };
      setBookings((prev) => [newBooking, ...prev]);
      setFormState({ serviceId: "", startAt: "", endAt: "", customerName: "" });
    } catch {
      setError("Rezerváciu sa nepodarilo vytvoriť. Skúste to znova.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] ring-1 ring-black/5">
        <h2 className="text-xl font-semibold">Nová rezervácia</h2>
        <p className="mt-1 text-sm text-slate-500">Vytvorte rezerváciu pre vybraného tenant-a.</p>

        <div className="mt-6 grid gap-4">
          <label className="grid gap-2 text-sm">
            Tenant
            <select
              className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
              value={tenantId}
              onChange={(event) => setTenantId(event.target.value)}
            >
              {tenants.map((tenant) => (
                <option key={tenant} value={tenant}>
                  {tenant}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Služba
              <input
                className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                value={formState.serviceId}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, serviceId: event.target.value }))
                }
                placeholder="napr. konzultácia"
              />
              {formErrors.serviceId && (
                <span className="text-xs text-rose-600">{formErrors.serviceId}</span>
              )}
            </label>
            <label className="grid gap-2 text-sm">
              Meno klienta
              <input
                className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                value={formState.customerName}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, customerName: event.target.value }))
                }
                placeholder="Meno priezvisko"
              />
              {formErrors.customerName && (
                <span className="text-xs text-rose-600">{formErrors.customerName}</span>
              )}
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              Začiatok
              <input
                type="datetime-local"
                className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                value={formState.startAt}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, startAt: event.target.value }))
                }
              />
              {formErrors.startAt && (
                <span className="text-xs text-rose-600">{formErrors.startAt}</span>
              )}
            </label>
            <label className="grid gap-2 text-sm">
              Koniec
              <input
                type="datetime-local"
                className="rounded-xl border border-[var(--color-border)] bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-200"
                value={formState.endAt}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, endAt: event.target.value }))
                }
              />
              {formErrors.endAt && (
                <span className="text-xs text-rose-600">{formErrors.endAt}</span>
              )}
            </label>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error}
            </div>
          )}

          <button
            className="rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            onClick={createBooking}
            disabled={submitDisabled}
            aria-disabled={submitDisabled}
          >
            {loading ? "Ukladám..." : "Vytvoriť rezerváciu"}
          </button>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Rezervácie</h2>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {tenantId}
          </span>
        </div>

        {loading && bookings.length === 0 ? (
          <p className="mt-6 text-sm text-slate-500">Načítavam rezervácie...</p>
        ) : bookings.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            Zatiaľ nemáte rezervácie. Vytvorte prvú vľavo.
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {bookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-xl border border-slate-200 p-4 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{booking.customerName}</p>
                    <p className="text-xs text-slate-500">
                      {booking.startAt} → {booking.endAt}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    {booking.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
