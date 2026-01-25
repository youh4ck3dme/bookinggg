import { Module } from "@nestjs/common";
import { AppController } from "./routes/app.controller.js";

@Module({
  controllers: [AppController]
})
export class AppModule {}
