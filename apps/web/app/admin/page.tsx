"use client";

import { useMemo, useState } from "react";
import { CalendarClock, LayoutDashboard, Settings } from "lucide-react";
import { useAdminData } from "../../hooks/useAdminData";
import { DashboardHome } from "./components/DashboardHome";
import { LiveCalendar } from "./components/LiveCalendar";
import { ServiceManager } from "./components/ServiceManager";

type AdminTab = "overview" | "calendar" | "services";

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("overview");
  const { bookings, services, settings, stats, loading, error, updateBookingStatus, updateService } =
    useAdminData();

  const upcomingBookings = useMemo(() => {
    const now = Date.now();
    return bookings
      .filter((booking) => new Date(booking.start_time).getTime() >= now)
      .sort(
        (a, b) =>
          new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
  }, [bookings]);

  return (
    <main className="min-h-screen bg-[#F2F2F7] p-4 dark:bg-black dark:text-white md:p-6">
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-[280px_1fr]">
        <aside className="rounded-2xl bg-white/80 p-4 shadow-lg backdrop-blur-2xl dark:bg-black/80">
          <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
          <p className="mt-1 text-sm text-slate-500">
            {settings?.shop_name ?? "Booking Command Center"}
          </p>

          <nav className="mt-6 space-y-2">
            <button
              onClick={() => setTab("overview")}
              className={`flex h-12 min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-left active:scale-95 ${
                tab === "overview" ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-[#1C1C1E]"
              }`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              onClick={() => setTab("calendar")}
              className={`flex h-12 min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-left active:scale-95 ${
                tab === "calendar" ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-[#1C1C1E]"
              }`}
            >
              <CalendarClock size={18} /> Live Calendar
            </button>
            <button
              onClick={() => setTab("services")}
              className={`flex h-12 min-h-[44px] w-full items-center gap-2 rounded-xl px-3 text-left active:scale-95 ${
                tab === "services" ? "bg-blue-500 text-white" : "bg-slate-100 dark:bg-[#1C1C1E]"
              }`}
            >
              <Settings size={18} /> Service Manager
            </button>
          </nav>
        </aside>

        <section className="space-y-4">
          {loading && (
            <div className="rounded-2xl bg-white p-5 shadow dark:bg-[#111]">Loading admin data...</div>
          )}

          {error && (
            <div className="rounded-2xl bg-red-50 p-5 text-red-700 shadow dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          {!loading && tab === "overview" && (
            <DashboardHome
              currency={settings?.currency ?? "EUR"}
              revenue={stats.todaysRevenue}
              pending={stats.pendingBookings}
              customers={stats.activeCustomers}
            />
          )}

          {!loading && tab === "calendar" && (
            <LiveCalendar
              bookings={upcomingBookings}
              onApprove={(id) => void updateBookingStatus(id, "confirmed")}
              onCancel={(id) => void updateBookingStatus(id, "cancelled")}
            />
          )}

          {!loading && tab === "services" && (
            <ServiceManager
              services={services}
              currency={settings?.currency ?? "EUR"}
              onSave={(id, payload) => void updateService(id, payload)}
            />
          )}
        </section>
      </div>
    </main>
  );
}
