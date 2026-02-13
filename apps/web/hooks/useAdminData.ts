"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BookingRow,
  BusinessSettingsRow,
  ServiceRow,
  getSupabaseClient
} from "../utils/supabase/client";

type AdminData = {
  services: ServiceRow[];
  bookings: BookingRow[];
  settings: BusinessSettingsRow | null;
};

type BookingSelectRow = {
  id: string;
  user_id: string;
  service_id: string;
  start_time: string;
  end_time: string;
  status: BookingRow["status"];
  notes: string | null;
  services: { title: string; price: number } | { title: string; price: number }[] | null;
};

export function useAdminData() {
  const [data, setData] = useState<AdminData>({
    services: [],
    bookings: [],
    settings: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError("Missing Supabase environment variables.");
      setLoading(false);
      return;
    }

    const [
      { data: services, error: servicesError },
      { data: bookings, error: bookingsError },
      { data: settings, error: settingsError }
    ] = await Promise.all([
      supabase
        .from("services")
        .select("id,title,description,price,duration_min,is_active")
        .order("title", { ascending: true }),
      supabase
        .from("bookings")
        .select("id,user_id,service_id,start_time,end_time,status,notes,services(title,price)")
        .order("start_time", { ascending: true }),
      supabase
        .from("business_settings")
        .select("id,shop_name,opening_hours_json,currency")
        .limit(1)
        .maybeSingle()
    ]);

    const firstError = servicesError ?? bookingsError ?? settingsError;
    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    const normalizedBookings: BookingRow[] = ((bookings ?? []) as BookingSelectRow[]).map(
      (booking) => {
        const serviceRelation = Array.isArray(booking.services)
          ? (booking.services[0] ?? null)
          : booking.services;

        return {
          id: booking.id,
          user_id: booking.user_id,
          service_id: booking.service_id,
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: booking.status,
          notes: booking.notes,
          services: serviceRelation
        };
      }
    );

    setData({
      services: (services ?? []) as ServiceRow[],
      bookings: normalizedBookings,
      settings: (settings ?? null) as BusinessSettingsRow | null
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();

    const supabase = getSupabaseClient();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-bookings-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        () => void load()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings" },
        () => void load()
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const stats = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const todays = data.bookings.filter((booking) => {
      const time = new Date(booking.start_time).getTime();
      return time >= startOfDay.getTime() && time <= endOfDay.getTime();
    });

    const revenue = todays
      .filter((booking) => booking.status === "confirmed" || booking.status === "completed")
      .reduce((sum, booking) => sum + Number(booking.services?.price ?? 0), 0);

    const pending = data.bookings.filter((booking) => booking.status === "pending").length;
    const activeCustomers = new Set(
      data.bookings
        .filter((booking) => booking.status !== "cancelled")
        .map((booking) => booking.user_id)
    ).size;

    return {
      todaysRevenue: revenue,
      pendingBookings: pending,
      activeCustomers
    };
  }, [data.bookings]);

  const updateBookingStatus = useCallback(
    async (bookingId: string, status: BookingRow["status"]) => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setError("Missing Supabase environment variables.");
        return;
      }

      const { error: updateError } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      await load();
    },
    [load]
  );

  const updateService = useCallback(
    async (serviceId: string, payload: { price?: number; is_active?: boolean }) => {
      const supabase = getSupabaseClient();
      if (!supabase) {
        setError("Missing Supabase environment variables.");
        return;
      }

      const { error: updateError } = await supabase
        .from("services")
        .update(payload)
        .eq("id", serviceId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      await load();
    },
    [load]
  );

  return {
    ...data,
    loading,
    error,
    stats,
    refresh: load,
    updateBookingStatus,
    updateService
  };
}
