import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ApiKeyGuard } from "./api-key.guard";
import { GlobalErrorFilter } from "./global-error.filter";
import helmet from "helmet";
import { NextFunction, Request, Response } from "express";
import * as Sentry from "@sentry/node";
import { logStructured } from "./structured-logger";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    environment: process.env.APP_ENV ?? process.env.NODE_ENV
  });
}

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
    const start = Date.now();

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

    res.on("finish", () => {
      logStructured("info", "http_request", {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Date.now() - start,
        requestId: req.headers["x-request-id"] ?? null
      });
    });

    next();
  });

  app.useGlobalGuards(new ApiKeyGuard());
  app.useGlobalFilters(new GlobalErrorFilter());

  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
  logStructured("info", "api_started", { port });
}

bootstrap().catch((error) => {
  logStructured("error", "bootstrap_failed", { error: error instanceof Error ? error.message : String(error) });
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error);
  }
  process.exit(1);
});
