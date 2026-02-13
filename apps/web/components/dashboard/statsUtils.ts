import { BookingRow } from "../../utils/supabase/client";

export type InvoiceRow = {
  id: string;
  status: string;
  amount: number;
};

export function calculateTotalRevenue(invoices: InvoiceRow[]) {
  return invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + Number(invoice.amount), 0);
}

export function calculateOccupancyRate(
  bookings: BookingRow[],
  totalOpeningHours: number
) {
  if (totalOpeningHours <= 0) return 0;

  const bookedHours = bookings.reduce((sum, booking) => {
    if (booking.status === "cancelled") return sum;
    const start = new Date(booking.start_time).getTime();
    const end = new Date(booking.end_time).getTime();
    const hours = Math.max((end - start) / (1000 * 60 * 60), 0);
    return sum + hours;
  }, 0);

  return Math.min((bookedHours / totalOpeningHours) * 100, 100);
}
