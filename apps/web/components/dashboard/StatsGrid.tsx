"use client";

type FeedItem = {
  id: string;
  type: "INSERT" | "UPDATE";
  bookingId: string;
  status: string;
  at: string;
};

export function StatsGrid({
  revenue,
  bookingsToday,
  occupancyRate,
  feed,
  currency
}: {
  revenue: number;
  bookingsToday: number;
  occupancyRate: number;
  feed: FeedItem[];
  currency: string;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <article className="glass-edge rounded-2xl bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all duration-300 dark:bg-black/60">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">
            {currency} {revenue.toFixed(2)}
          </p>
        </article>
        <article className="glass-edge rounded-2xl bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all duration-300 dark:bg-black/60">
          <p className="text-sm text-slate-500">Bookings Today</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{bookingsToday}</p>
        </article>
        <article className="glass-edge rounded-2xl bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition-all duration-300 dark:bg-black/60 sm:col-span-2 lg:col-span-1 xl:col-span-2">
          <p className="text-sm text-slate-500">Occupancy Rate</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{occupancyRate.toFixed(1)}%</p>
        </article>
      </div>

      <aside className="glass-edge rounded-2xl bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:bg-black/60">
        <h3 className="text-xl font-semibold">Live Feed</h3>
        <div className="mt-3 space-y-2">
          {feed.length === 0 ? (
            <p className="text-sm text-slate-500">No recent booking activity yet.</p>
          ) : (
            feed.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-slate-50 p-3 text-sm transition-all duration-300 dark:bg-[#1C1C1E]"
              >
                <p className="font-medium">
                  {item.type} · {item.status}
                </p>
                <p className="text-xs text-slate-500">Booking {item.bookingId.slice(0, 8)}</p>
                <p className="text-xs text-slate-400">{new Date(item.at).toLocaleTimeString()}</p>
              </div>
            ))
          )}
        </div>
      </aside>
    </section>
  );
}
