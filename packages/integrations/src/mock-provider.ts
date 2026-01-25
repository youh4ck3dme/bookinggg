// File: /packages/integrations/src/mock-provider.ts

import {
  BookingProvider,
  ProviderContext,
  ListAvailabilityInput,
  AvailabilitySlot,
  CreateBookingInput,
  BookingDTO,
  ListBookingsInput,
  BookingStatus,
} from '@ubm/core';

export class MockProvider implements BookingProvider {
  private bookings: BookingDTO[] = [];

  async ping(context: ProviderContext): Promise<boolean> {
    return true;
  }

  async listAvailability(
    context: ProviderContext,
    input: ListAvailabilityInput
  ): Promise<AvailabilitySlot[]> {
    const slots: AvailabilitySlot[] = [];
    const current = new Date(input.from);
    const end = new Date(input.to);

    while (current < end) {
      slots.push({
        startAt: new Date(current),
        endAt: new Date(current.getTime() + 60 * 60 * 1000), // 1 hour
        serviceId: input.serviceId,
        staffId: input.staffId,
        available: true,
      });
      current.setHours(current.getHours() + 1);
    }

    return slots;
  }

  async createBooking(
    context: ProviderContext,
    input: CreateBookingInput
  ): Promise<BookingDTO> {
    const booking: BookingDTO = {
      id: `mock-${Date.now()}`,
      tenantId: context.tenantId,
      integrationId: context.integrationId,
      providerId: 'mock',
      externalReservationId: `ext-${Date.now()}`,
      status: BookingStatus.CONFIRMED,
      startAt: input.startAt,
      endAt: input.endAt,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      notes: input.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.bookings.push(booking);
    return booking;
  }

  async cancelBooking(
    context: ProviderContext,
    bookingId: string
  ): Promise<BookingDTO> {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error(`Booking ${bookingId} not found`);
    }

    booking.status = BookingStatus.CANCELLED;
    booking.cancelledAt = new Date();
    booking.updatedAt = new Date();

    return booking;
  }

  async listBookings(
    context: ProviderContext,
    input: ListBookingsInput
  ): Promise<BookingDTO[]> {
    let filtered = this.bookings.filter((b) => b.tenantId === context.tenantId);

    if (input.from) {
      filtered = filtered.filter((b) => b.startAt >= input.from!);
    }

    if (input.to) {
      filtered = filtered.filter((b) => b.startAt <= input.to!);
    }

    if (input.status) {
      filtered = filtered.filter((b) => b.status === input.status);
    }

    return filtered;
  }
}
