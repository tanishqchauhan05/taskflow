import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Catches every exception thrown anywhere in the app and normalizes it
 * into a single response shape, so API consumers never have to guess
 * the error format:
 *
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "path": "/projects/123",
 *   "timestamp": "...",
 *   "message": "Project 123 not found",
 *   "error": "Not Found"
 * }
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : null;

    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (isHttpException) {
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else if (
        exceptionResponse &&
        typeof exceptionResponse === 'object'
      ) {
        const body = exceptionResponse as Record<string, unknown>;
        message = (body.message as string | string[]) ?? exception.message;
        error = (body.error as string) ?? exception.name;
      }
    } else if (exception instanceof Error) {
      // Don't leak internal error details to the client; log them instead.
      this.logger.error(exception.message, exception.stack);
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
      error,
    });
  }
}
