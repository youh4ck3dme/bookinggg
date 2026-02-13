import { Module } from "@nestjs/common";
import { ThrottlerModule } from "@nestjs/throttler";
import { BookingsController } from "./bookings.controller";
import { BookingAdapterService } from "./booking-adapter.service";
import { PrismaService } from "./prisma.service";
import { PrismaTenantConfigStore } from "./prisma-tenant-config.store";
import { ProviderFactory } from "./provider.factory";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 15 * 60 * 1000, limit: 5 }]
    }),
    AuthModule
  ],
  controllers: [BookingsController],
  providers: [
    BookingAdapterService,
    PrismaService,
    PrismaTenantConfigStore,
    ProviderFactory
  ]
})
export class AppModule {}
