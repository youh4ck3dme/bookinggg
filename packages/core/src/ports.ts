// File: /packages/core/src/ports.ts

import { AvailabilitySlot, BookingDTO, CreateBookingInput, ListAvailabilityInput, ListBookingsInput } from './types';

export interface ProviderContext {
  tenantId: string;
  integrationId: string;
  baseUrl?: string;
  settings: Record<string, any>;
  secrets: Record<string, string>;
}

export interface TenantProviderConfig {
  providerKey: string;
  context: ProviderContext;
}

export interface BookingProvider {
  ping(context: ProviderContext): Promise<boolean>;
  listAvailability(
    context: ProviderContext,
    input: ListAvailabilityInput
  ): Promise<AvailabilitySlot[]>;
  createBooking(
    context: ProviderContext,
    input: CreateBookingInput
  ): Promise<BookingDTO>;
  cancelBooking(
    context: ProviderContext,
    bookingId: string
  ): Promise<BookingDTO>;
  listBookings(
    context: ProviderContext,
    input: ListBookingsInput
  ): Promise<BookingDTO[]>;
}

export interface ProviderRegistry {
  register(providerKey: string, provider: BookingProvider): void;
  getProvider(providerKey: string): BookingProvider | undefined;
}
