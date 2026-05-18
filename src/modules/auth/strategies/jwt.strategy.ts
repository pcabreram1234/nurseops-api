import { Injectable } from "@nestjs/common";

import { PassportStrategy } from "@nestjs/passport";

import { ExtractJwt, Strategy } from "passport-jwt";

import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: configService.get<string>("JWT_SECRET") as string,
    });
  }

  async validate(payload: any) {
    return {
      id: payload.id,
      sub: payload.id, // Por compatibilidad con tu interceptor de auditoría
      email: payload.email,
      role: payload.role,
      organizationId: payload.organizationId,
      permissions: payload.permissions, // 👈 Tu Guard ahora leerá esto sin romper la línea user?.permissions
    };
  }
}
