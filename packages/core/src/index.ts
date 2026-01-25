export type BookingStatus = "CONFIRMED" | "CANCELLED" | "PENDING";

export interface CreateBookingInput {
  serviceId: string;
  startAt: string;
  endAt: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
}

export interface BookingDTO {
  id: string;
  tenantId: string;
  integrationId?: string;
  providerId?: string;
  externalReservationId?: string;
  status: BookingStatus;
  startAt: string;
  endAt: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string | null;
}

export interface AvailabilitySlot {
  id: string;
  serviceId?: string;
  staffId?: string;
  startAt: string;
  endAt: string;
  capacity?: number;
}

export interface TenantProviderConfig {
  tenantId: string;
  providerKey: string;
  baseUrl?: string;
  settings?: Record<string, unknown>;
  secrets?: Record<string, unknown>;
}

export interface ProviderContext {
  tenantId: string;
  integrationId?: string;
  config: TenantProviderConfig;
}

export interface BookingProvider {
  ping(context: ProviderContext): Promise<boolean>;
  listAvailability(
    context: ProviderContext,
    params: {
      from: string;
      to: string;
      serviceId?: string;
      staffId?: string;
    }
  ): Promise<AvailabilitySlot[]>;
  createBooking(
    context: ProviderContext,
    input: CreateBookingInput
  ): Promise<BookingDTO>;
  cancelBooking(context: ProviderContext, bookingId: string): Promise<void>;
  listBookings(
    context: ProviderContext,
    params: { from: string; to: string }
  ): Promise<BookingDTO[]>;
}

export interface ProviderRegistry {
  getProvider(providerKey: string): BookingProvider | undefined;
}
