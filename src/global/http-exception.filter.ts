import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface HttpExceptionResponse {
  message: string | string[];
  error: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extract HTTP exception details
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    const isObject =
      exceptionResponse !== null && typeof exceptionResponse === 'object';

    const errorResponse = isObject
      ? (exceptionResponse as HttpExceptionResponse)
      : null;

    const message: string | string[] =
      errorResponse?.message ??
      (typeof exceptionResponse === 'string'
        ? exceptionResponse
        : 'Internal server error');

    const error: string = errorResponse?.error ?? 'Internal Server Error';

    // ← LOG THE REAL ERROR (this is what was missing)
    this.logger.error({
      status,
      path: request.url,
      method: request.method,
      message: exception instanceof Error ? exception.message : 'Unknown error',
      stack: exception instanceof Error ? exception.stack : undefined,
      // In production, will send to Sentry
    });

    const isServerError = status >= 500;

    response.status(status).json({
      success: false,
      statusCode: status,
      error: isServerError ? 'Internal Server Error' : error,
      message: isServerError ? 'Internal server error' : message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}
