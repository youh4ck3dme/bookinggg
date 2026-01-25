import type {
  AvailabilitySlot,
  BookingDTO,
  BookingProvider,
  CreateBookingInput,
  ProviderContext,
  ProviderRegistry
} from "@ubm/core";

export class InMemoryProviderRegistry implements ProviderRegistry {
  private providers = new Map<string, BookingProvider>();

  register(providerKey: string, provider: BookingProvider) {
    this.providers.set(providerKey, provider);
  }

  getProvider(providerKey: string) {
    return this.providers.get(providerKey);
  }
}

const nowIso = () => new Date().toISOString();

export class MockProvider implements BookingProvider {
  async ping(): Promise<boolean> {
    return true;
  }

  async listAvailability(
    _context: ProviderContext,
    params: { from: string; to: string; serviceId?: string; staffId?: string }
  ): Promise<AvailabilitySlot[]> {
    return [
      {
        id: "slot_1",
        serviceId: params.serviceId,
        staffId: params.staffId,
        startAt: params.from,
        endAt: params.to,
        capacity: 1
      }
    ];
  }

  async createBooking(
    context: ProviderContext,
    input: CreateBookingInput
  ): Promise<BookingDTO> {
    const createdAt = nowIso();
    return {
      id: `mock_${Math.random().toString(36).slice(2)}`,
      tenantId: context.tenantId,
      integrationId: context.integrationId,
      providerId: "mock",
      externalReservationId: `ext_${Date.now()}`,
      status: "CONFIRMED",
      startAt: input.startAt,
      endAt: input.endAt,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      notes: input.notes,
      createdAt,
      updatedAt: createdAt,
      cancelledAt: null
    };
  }

  async cancelBooking(): Promise<void> {
    return;
  }

  async listBookings(): Promise<BookingDTO[]> {
    return [];
  }
}

export class WordPressProvider implements BookingProvider {
  constructor(private baseUrl: string, private request = fetch) {}

  async ping(): Promise<boolean> {
    const response = await this.request(`${this.baseUrl}/wp-json/ubm/v1/slots`);
    return response.ok;
  }

  async listAvailability(
    _context: ProviderContext,
    params: { from: string; to: string; serviceId?: string; staffId?: string }
  ): Promise<AvailabilitySlot[]> {
    const url = new URL(`${this.baseUrl}/wp-json/ubm/v1/slots`);
    url.searchParams.set("from", params.from);
    url.searchParams.set("to", params.to);
    if (params.serviceId) url.searchParams.set("serviceId", params.serviceId);
    if (params.staffId) url.searchParams.set("staffId", params.staffId);
    const response = await this.request(url.toString());
    if (!response.ok) return [];
    return (await response.json()) as AvailabilitySlot[];
  }

  async createBooking(
    _context: ProviderContext,
    input: CreateBookingInput
  ): Promise<BookingDTO> {
    const response = await this.request(`${this.baseUrl}/wp-json/ubm/v1/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input)
    });
    if (!response.ok) {
      throw new Error("Unable to create booking");
    }
    return (await response.json()) as BookingDTO;
  }

  async cancelBooking(_context: ProviderContext, bookingId: string): Promise<void> {
    await this.request(
      `${this.baseUrl}/wp-json/ubm/v1/bookings/${bookingId}/cancel`,
      { method: "POST" }
    );
  }

  async listBookings(
    _context: ProviderContext,
    params: { from: string; to: string }
  ): Promise<BookingDTO[]> {
    const url = new URL(`${this.baseUrl}/wp-json/ubm/v1/bookings`);
    url.searchParams.set("from", params.from);
    url.searchParams.set("to", params.to);
    const response = await this.request(url.toString());
    if (!response.ok) return [];
    return (await response.json()) as BookingDTO[];
  }
}
