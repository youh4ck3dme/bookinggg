import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers["x-api-key"]; 
    const expected = process.env.API_KEY;
    if (!expected) return true;
    return apiKey === expected;
  }
}
