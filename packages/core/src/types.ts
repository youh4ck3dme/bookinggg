// File: /packages/core/src/types.ts

export interface CreateBookingInput {
  serviceId?: string;
  staffId?: string;
  startAt: Date;
  endAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
}

export interface BookingDTO {
  id: string;
  tenantId: string;
  integrationId: string;
  providerId: string;
  externalReservationId?: string;
  status: BookingStatus;
  startAt: Date;
  endAt: Date;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  notes?: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface AvailabilitySlot {
  startAt: Date;
  endAt: Date;
  serviceId?: string;
  staffId?: string;
  available: boolean;
}

export interface ListAvailabilityInput {
  from: Date;
  to: Date;
  serviceId?: string;
  staffId?: string;
}

export interface ListBookingsInput {
  from?: Date;
  to?: Date;
  status?: BookingStatus;
}
