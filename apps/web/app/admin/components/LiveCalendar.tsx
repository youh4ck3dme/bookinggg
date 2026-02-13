"use client";

import type { BookingRow } from "../../../utils/supabase/client";

const statusStyles: Record<BookingRow["status"], string> = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-orange-100 text-orange-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-blue-100 text-blue-700"
};

export function LiveCalendar({
  bookings,
  onApprove,
  onCancel
}: {
  bookings: BookingRow[];
  onApprove: (bookingId: string) => void;
  onCancel: (bookingId: string) => void;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:bg-[#111]">
      <h2 className="text-2xl font-semibold">Live Calendar</h2>
      <p className="mt-1 text-sm text-slate-500">Upcoming bookings sorted by time.</p>

      <div className="mt-4 space-y-3">
        {bookings.length === 0 ? (
          <p className="text-sm text-slate-500">No upcoming bookings.</p>
        ) : (
          bookings.map((booking) => (
            <article
              key={booking.id}
              className="flex flex-col gap-3 rounded-2xl bg-slate-50 p-4 md:flex-row md:items-center md:justify-between dark:bg-[#1C1C1E]"
            >
              <div>
                <p className="font-medium">{booking.services?.title ?? "Service"}</p>
                <p className="text-sm text-slate-500">
                  {new Date(booking.start_time).toLocaleString()} → {new Date(booking.end_time).toLocaleTimeString()}
                </p>
                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-medium ${statusStyles[booking.status]}`}
                >
                  {booking.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onApprove(booking.id)}
                  className="h-11 min-h-[44px] rounded-xl bg-emerald-500 px-4 text-sm font-semibold text-white active:scale-95"
                >
                  Approve
                </button>
                <button
                  onClick={() => onCancel(booking.id)}
                  className="h-11 min-h-[44px] rounded-xl bg-red-500 px-4 text-sm font-semibold text-white active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
