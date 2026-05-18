import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";

import { Observable } from "rxjs";

import { tap } from "rxjs/operators";

import { PrismaService } from "@infra/database/prisma.service";

import { ActionAuditLogTypes } from "@prisma/client";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,

    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    /*
    |--------------------------------------------------------------------------
    | REQUEST DATA
    |--------------------------------------------------------------------------
    */

    const method = request.method;

    const user = request.user;

    const params = request.params;

    const body = request.body;

    const path = request.originalUrl;

    const ipAddress = request.ip || request.connection?.remoteAddress;

    const userAgent = request.headers["user-agent"];

    const requestId = request.headers["x-request-id"] || crypto.randomUUID();

    /*
    |--------------------------------------------------------------------------
    | ONLY AUDIT MUTATIONS
    |--------------------------------------------------------------------------
    */

    const auditableMethods = ["POST", "PATCH", "PUT", "DELETE"];

    if (!auditableMethods.includes(method)) {
      return next.handle();
    }

    /*
    |--------------------------------------------------------------------------
    | IGNORED ROUTES
    |--------------------------------------------------------------------------
    */

    const ignoredRoutes = [
      "/api/v1/auth/login",
      "/api/v1/auth/refresh",
      "/health",
      "/docs",
    ];

    if (ignoredRoutes.some((route) => path.includes(route))) {
      return next.handle();
    }

    /*
    |--------------------------------------------------------------------------
    | MODULE DETECTION
    |--------------------------------------------------------------------------
    */

    const module = this.extractModule(path);

    /*
    |--------------------------------------------------------------------------
    | ENTITY ID
    |--------------------------------------------------------------------------
    */

    const moduleId = params?.id || null;

    /*
    |--------------------------------------------------------------------------
    | OLD VALUE
    |--------------------------------------------------------------------------
    */

    let oldValue = null;

    try {
      if (["PATCH", "PUT", "DELETE"].includes(method) && moduleId) {
        oldValue = await this.findOldValue(module, moduleId);
      }
    } catch (error) {
      console.error("Failed loading old value", error);
    }

    return next.handle().pipe(
      tap(async (response) => {
        try {
          /*
          |--------------------------------------------------------------------------
          | ACTION
          |--------------------------------------------------------------------------
          */

          const action = this.mapMethodToAction(method);

          /*
          |--------------------------------------------------------------------------
          | RESPONSE ENTITY ID
          |--------------------------------------------------------------------------
          */

          const resolvedModuleId = response?.id || moduleId;

          /*
          |--------------------------------------------------------------------------
          | SANITIZE VALUES
          |--------------------------------------------------------------------------
          */

          const sanitizedOldValue = this.sanitizeData(oldValue);

          const sanitizedNewValue = this.sanitizeData(response);

          /*
          |--------------------------------------------------------------------------
          | CREATE AUDIT LOG
          |--------------------------------------------------------------------------
          */

          /*
          |--------------------------------------------------------------------------
          | FUTURE IMPROVEMENT:
          | SEND THIS TO QUEUE
          |--------------------------------------------------------------------------
          */

          await this.prisma.auditLog.create({
            data: {
              userId: user?.sub || null,

              organizationId: user?.organizationId || null,

              action: action as ActionAuditLogTypes,

              moduleId: resolvedModuleId,

              old_value: sanitizedOldValue,

              new_value: sanitizedNewValue,

              ipAddress,

              userAgent,

              requestId,

              createdAt: new Date(),
            },
          });
        } catch (error) {
          console.error("Audit interceptor error", error);
        }
      }),
    );
  }

  /*
  |--------------------------------------------------------------------------
  | METHOD → ACTION
  |--------------------------------------------------------------------------
  */

  private mapMethodToAction(method: string) {
    switch (method) {
      case "POST":
        return "CREATE";

      case "PATCH":
        return "UPDATE";

      case "PUT":
        return "UPDATE";

      case "DELETE":
        return "DELETE";

      default:
        return method;
    }
  }

  /*
  |--------------------------------------------------------------------------
  | EXTRACT MODULE
  |--------------------------------------------------------------------------
  */

  private extractModule(path: string) {
    try {
      const cleanPath = path.split("?")[0];

      const segments = cleanPath.split("/").filter(Boolean);

      /*
      |--------------------------------------------------------------------------
      | /api/v1/users
      |--------------------------------------------------------------------------
      */

      return segments[2] || "unknown";
    } catch {
      return "unknown";
    }
  }

  /*
  |--------------------------------------------------------------------------
  | SANITIZE DATA
  |--------------------------------------------------------------------------
  */

  private sanitizeData(data: any) {
    if (!data) {
      return data;
    }

    /*
    |--------------------------------------------------------------------------
    | CLONE OBJECT
    |--------------------------------------------------------------------------
    */

    const cloned = JSON.parse(JSON.stringify(data));

    /*
    |--------------------------------------------------------------------------
    | SENSITIVE FIELDS
    |--------------------------------------------------------------------------
    */

    const sensitiveFields = [
      "password",
      "refreshToken",
      "accessToken",
      "token",
      "secret",
      "apiKey",
    ];

    this.removeSensitiveFields(cloned, sensitiveFields);

    return cloned;
  }

  /*
  |--------------------------------------------------------------------------
  | REMOVE SENSITIVE FIELDS RECURSIVELY
  |--------------------------------------------------------------------------
  */

  private removeSensitiveFields(
    obj: any,

    sensitiveFields: string[],
  ) {
    if (!obj || typeof obj !== "object") {
      return;
    }

    Object.keys(obj).forEach((key) => {
      if (sensitiveFields.includes(key)) {
        delete obj[key];
      } else if (typeof obj[key] === "object") {
        this.removeSensitiveFields(obj[key], sensitiveFields);
      }
    });
  }

  /*
  |--------------------------------------------------------------------------
  | FIND OLD VALUE
  |--------------------------------------------------------------------------
  */

  private async findOldValue(
    module: string,

    id: string,
  ) {
    /*
    |--------------------------------------------------------------------------
    | IMPORTANT:
    | THIS CAN BE REFACTORED LATER
    | USING A MODULE REGISTRY
    |--------------------------------------------------------------------------
    */

    const modelMap: Record<string, any> = {
      users: this.prisma.user,

      organizations: this.prisma.organization,

      roles: this.prisma.roles,

      permissions: this.prisma.permission,
    };

    const prismaModel = modelMap[module];

    if (!prismaModel) {
      return null;
    }

    return prismaModel.findUnique({
      where: {
        id,
      },
    });
  }
}
