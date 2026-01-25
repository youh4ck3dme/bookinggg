import assert from "node:assert/strict";
import test from "node:test";
import { InMemoryProviderRegistry, MockProvider } from "../index.js";

const createContext = () => ({
  tenantId: "tenant_1",
  integrationId: "integration_1",
  config: { tenantId: "tenant_1", providerKey: "mock" }
});

test("mock provider creates booking and registry resolves", async () => {
  const registry = new InMemoryProviderRegistry();
  const provider = new MockProvider();
  registry.register("mock", provider);

  const resolved = registry.getProvider("mock");
  assert.equal(resolved, provider);

  const booking = await provider.createBooking(createContext(), {
    serviceId: "svc",
    startAt: new Date().toISOString(),
    endAt: new Date(Date.now() + 3600000).toISOString(),
    customerName: "Test User"
  });

  assert.equal(booking.status, "CONFIRMED");
  assert.equal(booking.tenantId, "tenant_1");
});
