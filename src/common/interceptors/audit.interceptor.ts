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

import { AuditActionMapperService } from "@modules/audit-log/services/audit-action-mapper.service";

import { AuditRouteFilterService } from "@modules/audit-log/services/audit-route-filter.service";

import { AuditSanitizerService } from "@modules/audit-log/services/audit-sanitizer.service";

@Injectable()
export class AuditInterceptor
  implements NestInterceptor {
  constructor(
    private readonly eventEmitter: EventEmitter2,

    private readonly actionMapper: AuditActionMapperService,

    private readonly routeFilter: AuditRouteFilterService,

    private readonly sanitizer: AuditSanitizerService,
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

    return next.handle().pipe(
      tap(
        async (
          response,
        ) => {
          try {
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