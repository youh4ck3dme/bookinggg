import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}

bootstrap();
