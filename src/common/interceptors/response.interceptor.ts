import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from "@nestjs/common";

import { Observable } from "rxjs";

import { map } from "rxjs/operators";

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,

    next: CallHandler,
  ): Observable<any> {
    return next.handle().pipe(
      map((response) => {
        /*
        |--------------------------------------------------------------------------
        | PAGINATED RESPONSE
        |--------------------------------------------------------------------------
        */

        if (response?.data && response?.meta) {
          return {
            success: true,

            timestamp: new Date().toISOString(),

            data: response.data,

            meta: response.meta,
          };
        }

        /*
        |--------------------------------------------------------------------------
        | DEFAULT RESPONSE
        |--------------------------------------------------------------------------
        */

        return {
          success: true,

          timestamp: new Date().toISOString(),

          data: response,
        };
      }),
    );
  }
}
