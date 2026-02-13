import { Injectable } from "@nestjs/common";

import { BookingDTO, CreateBookingInput, ProviderContext } from "@bookinggg/core";

type UnifiedBookingRecord = {
  id: string;
  tenantId: string;
  providerId: string;
  externalReservationId: string;
  status: string;
  startAt: Date;
  endAt: Date;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  notes: string | null;
};

import { PrismaService } from "./prisma.service";
import { PrismaTenantConfigStore } from "./prisma-tenant-config.store";
import { ProviderFactory } from "./provider.factory";

@Injectable()
export class BookingAdapterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configStore: PrismaTenantConfigStore,
    private readonly providerFactory: ProviderFactory
  ) {}

  async getSlots(
    tenantId: string,
    from: string,
    to: string,
    serviceId?: string,
    staffId?: string
  ) {
    const config = await this.configStore.getLatestConfig(tenantId);
    const provider = this.providerFactory.getProvider(config);
    const context: ProviderContext = { tenantId, config };
    return provider.listAvailability(context, { from, to, serviceId, staffId });
  }

  async listBookings(tenantId: string, from: string, to: string) {
    const bookings = await this.prisma.unifiedBooking.findMany({
      where: {
        tenantId,
        startAt: { gte: new Date(from) },
        endAt: { lte: new Date(to) }
      },
      orderBy: { startAt: "asc" }
    });
    return bookings.map(this.toDTO);
  }

  async createBooking(
    tenantId: string,
    input: CreateBookingInput,
    idempotencyKey?: string
  ) {
    if (idempotencyKey) {
      const existing = await this.prisma.unifiedBooking.findFirst({
        where: { tenantId, idempotencyKey }
      });
      if (existing) {
        return this.toDTO(existing);
      }
    }

    const config = await this.configStore.getLatestConfig(tenantId);
    const provider = this.providerFactory.getProvider(config);
    const context: ProviderContext = { tenantId, config };
    const providerBooking = await provider.createBooking(context, input);

    try {
      const booking = await this.prisma.unifiedBooking.create({
        data: {
          tenantId,
          integrationId: config.integrationId,
          providerId: providerBooking.providerId,
          externalReservationId: providerBooking.externalReservationId,
          status: providerBooking.status,
          startAt: new Date(providerBooking.startAt),
          endAt: new Date(providerBooking.endAt),
          customerName: providerBooking.customerName,
          customerEmail: providerBooking.customerEmail,
          customerPhone: providerBooking.customerPhone,
          notes: providerBooking.notes,
          idempotencyKey
        }
      });
      return this.toDTO(booking);
    } catch (error) {
      if (this.isUniqueViolation(error) && idempotencyKey) {
        const existing = await this.prisma.unifiedBooking.findFirst({
          where: { tenantId, idempotencyKey }
        });
        if (existing) return this.toDTO(existing);
      }
      throw error;
    }
  }

  async cancelBooking(tenantId: string, bookingId: string) {
    const booking = await this.prisma.unifiedBooking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED", cancelledAt: new Date() }
    });
    return this.toDTO(booking);
  }

  private toDTO(booking: UnifiedBookingRecord): BookingDTO {
    return {
      id: booking.id,
      tenantId: booking.tenantId,
      providerId: booking.providerId,
      externalReservationId: booking.externalReservationId,
      status: booking.status,
      startAt: booking.startAt.toISOString(),
      endAt: booking.endAt.toISOString(),
      customerName: booking.customerName,
      customerEmail: booking.customerEmail ?? undefined,
      customerPhone: booking.customerPhone ?? undefined,
      notes: booking.notes ?? undefined
    };
  }

  private isUniqueViolation(error: unknown) {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    );
  }
}
