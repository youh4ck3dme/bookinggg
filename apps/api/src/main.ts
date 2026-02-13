import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ApiKeyGuard } from "./api-key.guard";
import { GlobalErrorFilter } from "./global-error.filter";
import helmet from "helmet";
import { NextFunction, Request, Response } from "express";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const origins = (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim());

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["content-type", "authorization", "x-api-key", "x-csrf-token", "idempotency-key"]
  });

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: []
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    })
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: true
    })
  );

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === "GET" && req.path === "/auth/csrf") {
      const token = Math.random().toString(36).slice(2);
      res.setHeader("x-csrf-token", token);
      return res.json({ csrfToken: token });
    }

    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && req.path.startsWith("/auth")) {
      const csrfToken = req.headers["x-csrf-token"];
      if (!csrfToken) {
        return res.status(403).json({ error: { message: "Missing CSRF token", status: 403 } });
      }
    }

    next();
  });

  app.useGlobalGuards(new ApiKeyGuard());
  app.useGlobalFilters(new GlobalErrorFilter());

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000);
}

bootstrap();
