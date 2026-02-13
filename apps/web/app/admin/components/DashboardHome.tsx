"use client";

export function DashboardHome({
  currency,
  revenue,
  pending,
  customers
}: {
  currency: string;
  revenue: number;
  pending: number;
  customers: number;
}) {
  const cards = [
    {
      label: "Today's Revenue",
      value: `${currency} ${revenue.toFixed(2)}`
    },
    {
      label: "Pending Bookings",
      value: String(pending)
    },
    {
      label: "Active Customers",
      value: String(customers)
    }
  ];

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => (
        <article
          key={card.label}
          className="rounded-2xl bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:bg-black/60"
        >
          <p className="text-sm text-slate-500 dark:text-slate-300">{card.label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{card.value}</p>
        </article>
      ))}
    </section>
  );
}
