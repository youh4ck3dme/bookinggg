// File: /packages/integrations/src/registry.ts

import { BookingProvider, ProviderRegistry } from '@ubm/core';

export class InMemoryProviderRegistry implements ProviderRegistry {
  private providers = new Map<string, BookingProvider>();

  register(providerKey: string, provider: BookingProvider): void {
    this.providers.set(providerKey, provider);
  }

  getProvider(providerKey: string): BookingProvider | undefined {
    return this.providers.get(providerKey);
  }
}
