import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from "@nestjs/common";

import { Request, Response } from "express";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(
    exception: unknown,

    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const request = ctx.getRequest<Request>();

    /*
    |--------------------------------------------------------------------------
    | DEFAULT VALUES
    |--------------------------------------------------------------------------
    */

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    let message = "Internal server error";

    let error = "Error";

    /*
    |--------------------------------------------------------------------------
    | HTTP EXCEPTIONS
    |--------------------------------------------------------------------------
    */

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      /*
      |--------------------------------------------------------------------------
      | STRING RESPONSE
      |--------------------------------------------------------------------------
      */

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      }

      /*
      |--------------------------------------------------------------------------
      | OBJECT RESPONSE
      |--------------------------------------------------------------------------
      */

      if (typeof exceptionResponse === "object") {
        const responseObj = exceptionResponse as any;

        message = responseObj.message || message;

        error = responseObj.error || error;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | LOG ERROR
    |--------------------------------------------------------------------------
    */

    console.error(exception);

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    */

    response.status(status).json({
      success: false,

      statusCode: status,

      message,

      error,

      timestamp: new Date().toISOString(),

      path: request.url,
    });
  }
}
