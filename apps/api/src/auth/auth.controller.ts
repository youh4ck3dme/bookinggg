import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service";
import {
  BiometricDto,
  LoginDto,
  OAuthLoginDto,
  RefreshDto,
  RegisterDto,
  Setup2faDto
} from "./dto/auth.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { CurrentUser } from "./current-user.decorator";

@Controller("/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("/login")
  @HttpCode(200)
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req.ip ?? "0.0.0.0", req.headers["user-agent"]);
  }

  @Post("/oauth")
  @HttpCode(200)
  oauth(@Body() dto: OAuthLoginDto, @Req() req: Request) {
    return this.authService.loginWithOAuth(dto, req.ip ?? "0.0.0.0", req.headers["user-agent"]);
  }

  @Post("/refresh")
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto, @Req() req: Request) {
    return this.authService.refresh(dto.refreshToken, req.ip ?? "0.0.0.0", req.headers["user-agent"]);
  }

  @Post("/logout")
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  logout(@Req() req: Request, @Body() dto?: RefreshDto) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    if (!token) {
      throw new UnauthorizedException("Missing access token");
    }
    return this.authService.logout(token, dto?.refreshToken);
  }

  @Get("/verify")
  @UseGuards(JwtAuthGuard)
  verify(@CurrentUser() user: { userId: string; email: string }) {
    return { valid: true, user };
  }

  @Post("/2fa/setup")
  @UseGuards(JwtAuthGuard)
  setup2fa(@CurrentUser() user: { userId: string }) {
    return this.authService.create2faSecret(user.userId);
  }

  @Post("/2fa/enforce")
  @UseGuards(JwtAuthGuard)
  enforce2fa(
    @CurrentUser() user: { userId: string },
    @Body() dto: Setup2faDto
  ) {
    return this.authService.enforce2fa(user.userId, dto.token);
  }

  @Post("/biometric")
  @HttpCode(200)
  biometric(@Body() dto: BiometricDto) {
    return this.authService.biometric(dto);
  }

  @Get("/sessions")
  @UseGuards(JwtAuthGuard)
  sessions(@CurrentUser() user: { userId: string }) {
    return this.authService.sessions(user.userId);
  }

  @Get("/csrf")
  csrf(@Headers("x-csrf-token") csrfToken?: string) {
    return { ok: true, csrfToken: csrfToken ?? null };
  }
}
