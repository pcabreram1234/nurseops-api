import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";

import { Reflector } from "@nestjs/core";

import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    /*
    |--------------------------------------------------------------------------
    | REQUIRED PERMISSIONS
    |--------------------------------------------------------------------------
    */

    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    /*
    |--------------------------------------------------------------------------
    | NO PERMISSIONS REQUIRED
    |--------------------------------------------------------------------------
    */

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    /*
    |--------------------------------------------------------------------------
    | REQUEST USER
    |--------------------------------------------------------------------------
    */

    const request = context.switchToHttp().getRequest();

    const user = request.user;

    /*
    |--------------------------------------------------------------------------
    | SUPER BYPASS
    |--------------------------------------------------------------------------
    */

    if (user?.role === "SUPER") {
      return true;
    }

    /*
    |--------------------------------------------------------------------------
    | USER PERMISSIONS
    |--------------------------------------------------------------------------
    */

    const userPermissions = user?.permissions || [];

    /*
    |--------------------------------------------------------------------------
    | VALIDATE
    |--------------------------------------------------------------------------
    */

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
