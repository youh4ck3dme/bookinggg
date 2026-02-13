"use client";

import { useEffect, useMemo, useState } from "react";
import { RevenueChart } from "../../components/dashboard/RevenueChart";
import { StatsGrid } from "../../components/dashboard/StatsGrid";
import {
  InvoiceRow,
  calculateOccupancyRate,
  calculateTotalRevenue
} from "../../components/dashboard/statsUtils";
import { useRealtimeBookings } from "../../hooks/useRealtimeBookings";
import { getSupabaseClient } from "../../utils/supabase/client";

const FALLBACK_OPENING_HOURS_PER_DAY = 10;

export default function AdminPage() {
  const { bookings, feed, bookingsToday, loading, error } = useRealtimeBookings();
  const [currency, setCurrency] = useState("EUR");
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const loadMeta = async () => {
      const [{ data: settings }, { data: invoicesData }] = await Promise.all([
        supabase
          .from("business_settings")
          .select("currency")
          .limit(1)
          .maybeSingle(),
        supabase
          .from("invoices")
          .select("id,status,amount")
          .order("id", { ascending: false })
          .limit(500)
      ]);

      if (settings?.currency) setCurrency(settings.currency);
      if (invoicesData) {
        setInvoices(
          (invoicesData as Array<{ id: string; status: string; amount: number }>).map((invoice) => ({
            id: invoice.id,
            status: invoice.status,
            amount: Number(invoice.amount)
          }))
        );
      }
    };

    void loadMeta();
  }, []);

  const totalRevenue = useMemo(() => calculateTotalRevenue(invoices), [invoices]);

  const occupancyRate = useMemo(() => {
    const totalOpeningHoursWeekly = FALLBACK_OPENING_HOURS_PER_DAY * 7;
    return calculateOccupancyRate(bookings, totalOpeningHoursWeekly);
  }, [bookings]);

  const chartData = useMemo(() => {
    const perDay = new Map<string, number>();
    for (const booking of bookings) {
      const dayLabel = new Date(booking.start_time).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      });
      const current = perDay.get(dayLabel) ?? 0;
      perDay.set(dayLabel, current + Number(booking.services?.price ?? 0));
    }

    return Array.from(perDay.entries())
      .map(([label, value]) => ({ label, value }))
      .slice(-14);
  }, [bookings]);

  return (
    <main className="min-h-screen bg-[#F2F2F7] p-4 dark:bg-black dark:text-white md:p-6">
      <div className="mx-auto grid max-w-7xl gap-4">
        <header className="glass-edge rounded-2xl bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:bg-black/60">
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Realtime booking brain with analytics and live actions.</p>
        </header>

        {error && (
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="glass-edge rounded-2xl bg-white/80 p-6 backdrop-blur-2xl dark:bg-black/60">
            Loading realtime feed...
          </div>
        ) : (
          <>
            <StatsGrid
              revenue={totalRevenue}
              bookingsToday={bookingsToday}
              occupancyRate={occupancyRate}
              feed={feed}
              currency={currency}
            />
            <RevenueChart data={chartData} />
          </>
        )}
      </div>
    </main>
  );
}
