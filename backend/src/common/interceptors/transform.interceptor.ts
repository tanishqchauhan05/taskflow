import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  path: string;
  timestamp: string;
  data: T;
}

/**
 * Wraps every successful controller response in a consistent envelope,
 * mirroring the shape AllExceptionsFilter uses for errors:
 *
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "path": "/projects",
 *   "timestamp": "...",
 *   "data": [...]
 * }
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const httpContext = context.switchToHttp();
    const response = httpContext.getResponse();
    const request = httpContext.getRequest();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode: response.statusCode,
        path: request.url,
        timestamp: new Date().toISOString(),
        data,
      })),
    );
  }
}
