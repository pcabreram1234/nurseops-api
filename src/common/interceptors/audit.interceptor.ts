import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";

import { Observable } from "rxjs";

import { tap } from "rxjs/operators";

import { EventEmitter2 } from "@nestjs/event-emitter";

import { randomUUID } from "crypto";

import { PrismaService } from "@infra/database/prisma.service";

import { AuditActionMapperService } from "@modules/audit-log/services/audit-action-mapper.service";

import { AuditRouteFilterService } from "@modules/audit-log/services/audit-route-filter.service";

import { AuditSanitizerService } from "@modules/audit-log/services/audit-sanitizer.service";

/**
 * Mapeo segmento de ruta → modelo Prisma para tomar el snapshot
 * del estado ANTES de una mutación sobre `/:id` (old_value real).
 */
const AUDITABLE_MODEL_BY_PATH: Record<string, string> = {
  schedules: "schedule",
  "schedule-entries": "scheduleEntry",
  absences: "absence",
  vacations: "vacation",
  "nurse-availability": "nurseAvailability",
  nurses: "nurse",
  users: "user",
  roles: "roles",
  departments: "department",
  branches: "branch",
  organizations: "organization",
  "shift-templates": "shiftTemplate",
  "work-rules": "workRule",
  "work-rule-conditions": "workRuleConditions",
  "work-rule-actions": "workRuleActions",
  integrations: "integration",
  "shift-change-requests": "shiftChangeRequest",
  "notification-templates": "notificationTemplate",
};

@Injectable()
export class AuditInterceptor
  implements NestInterceptor {
  constructor(
    private readonly eventEmitter: EventEmitter2,

    private readonly actionMapper: AuditActionMapperService,

    private readonly routeFilter: AuditRouteFilterService,

    private readonly sanitizer: AuditSanitizerService,

    private readonly prisma: PrismaService,
  ) { }

  intercept(
    context: ExecutionContext,

    next: CallHandler,
  ): Observable<any> {
    const request =
      context
        .switchToHttp()
        .getRequest();

    /*
    |--------------------------------------------------------------------------
    | REQUEST DATA
    |--------------------------------------------------------------------------
    */

    const method =
      request.method;

    const path =
      request.originalUrl;

    /*
    |--------------------------------------------------------------------------
    | FILTER REQUESTS
    |--------------------------------------------------------------------------
    */

    if (
      !this.routeFilter.shouldAudit(
        method,
        path,
      )
    ) {
      return next.handle();
    }

    /*
    |--------------------------------------------------------------------------
    | REQUEST CONTEXT
    |--------------------------------------------------------------------------
    */

    const user =
      request.user;

    const requestId =
      request.headers[
      "x-request-id"
      ] ||
      randomUUID();

    const auditContext =
    {
      requestId,

      method,

      path,

      params:
        request.params,

      query:
        request.query,

      body:
        this.sanitizer.sanitize(
          request.body,
        ),

      ipAddress:
        request.ip,

      userAgent:
        request.headers[
        "user-agent"
        ],

      organizationId:
        user?.organizationId,

      userId:
        user?.sub,
    };

    /*
    |--------------------------------------------------------------------------
    | SNAPSHOT PRE-UPDATE (old_value real para PATCH/PUT/DELETE sobre /:id)
    |--------------------------------------------------------------------------
    */

    const oldValuePromise = this.snapshotBefore(
      method,
      path,
      request.params,
    );

    return next.handle().pipe(
      tap(
        async (
          response,
        ) => {
          try {
            const oldValue = await oldValuePromise;

            /*
            |--------------------------------------------------------------------------
            | EMIT EVENT
            |--------------------------------------------------------------------------
            */

            this.eventEmitter.emit(
              "audit.created",
              {
                action:
                  this.actionMapper.map(
                    method,
                  ),

                module:
                  this.extractModule(
                    path,
                  ),

                oldValue,

                response:
                  this.sanitizer.sanitize(
                    response,
                  ),

                context:
                  auditContext,
              },
            );
          } catch (
          error
          ) {
            console.error(
              "Audit event error",
              error,
            );
          }
        },
      ),
    );
  }

  /**
   * Lee el registro ANTES de que el handler lo modifique.
   * Devuelve `null` si no aplica o si algo falla (nunca rompe la petición).
   */
  private async snapshotBefore(
    method: string,
    path: string,
    params: Record<string, string>,
  ): Promise<any | null> {
    if (!["PATCH", "PUT", "DELETE"].includes(method)) return null;
    if (!params?.id) return null;

    try {
      const segment = this.extractModule(path);
      const modelKey = AUDITABLE_MODEL_BY_PATH[segment];
      if (!modelKey) return null;

      const model = (this.prisma as any)[modelKey];
      if (!model?.findUnique) return null;

      const record = await model.findUnique({ where: { id: params.id } });
      if (!record) return null;

      return this.sanitizer.sanitize(record);
    } catch {
      return null;
    }
  }

  private extractModule(
    path: string,
  ) {
    try {
      const cleanPath =
        path.split("?")[0];

      const segments =
        cleanPath
          .split("/")
          .filter(Boolean);

      return (
        segments[2] ||
        "unknown"
      );
    } catch {
      return "unknown";
    }
  }
}