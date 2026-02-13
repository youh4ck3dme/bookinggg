"use client";

import { useMemo, useState } from "react";
import type { ServiceRow } from "../../../utils/supabase/client";

export function ServiceManager({
  services,
  currency,
  onSave
}: {
  services: ServiceRow[];
  currency: string;
  onSave: (serviceId: string, payload: { price?: number; is_active?: boolean }) => void;
}) {
  const [openServiceId, setOpenServiceId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState<string>("");
  const [activeInput, setActiveInput] = useState(true);

  const selectedService = useMemo(
    () => services.find((service) => service.id === openServiceId) ?? null,
    [openServiceId, services]
  );

  return (
    <section className="glass-edge rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:bg-[#111]">
      <h2 className="text-2xl font-semibold">Service Manager</h2>
      <p className="mt-1 text-sm text-slate-500">Update pricing and availability.</p>

      <div className="mt-4 space-y-3">
        {services.map((service) => (
          <article
            key={service.id}
            className="flex items-center justify-between glass-edge rounded-2xl bg-slate-50 p-4 dark:bg-[#1C1C1E]"
          >
            <div>
              <p className="font-medium">{service.title}</p>
              <p className="text-sm text-slate-500">
                {currency} {service.price.toFixed(2)} · {service.duration_min} min
              </p>
            </div>
            <button
              onClick={() => {
                setOpenServiceId(service.id);
                setPriceInput(String(service.price));
                setActiveInput(service.is_active);
              }}
              className="h-11 min-h-[44px] rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white active:scale-95"
            >
              Edit
            </button>
          </article>
        ))}
      </div>

      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 md:items-center">
          <div className="glass-edge w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#1C1C1E]">
            <h3 className="text-xl font-semibold">Edit {selectedService.title}</h3>
            <label className="mt-4 block text-sm font-medium">Price</label>
            <input
              value={priceInput}
              onChange={(event) => setPriceInput(event.target.value)}
              className="mt-1 h-11 w-full rounded-xl bg-slate-100 px-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <label className="mt-3 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={activeInput}
                onChange={(event) => setActiveInput(event.target.checked)}
              />
              Service is active
            </label>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setOpenServiceId(null)}
                className="h-11 min-h-[44px] flex-1 rounded-xl bg-slate-200 text-sm font-semibold active:scale-95 dark:bg-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onSave(selectedService.id, {
                    price: Number(priceInput),
                    is_active: activeInput
                  });
                  setOpenServiceId(null);
                }}
                className="h-11 min-h-[44px] flex-1 rounded-xl bg-blue-500 text-sm font-semibold text-white active:scale-95"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
