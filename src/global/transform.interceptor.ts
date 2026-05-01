import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface TransformedResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  TransformedResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<TransformedResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      map((data: T) => ({
        success: true,
        statusCode: response.statusCode,
        data,
        message: 'Request successful',
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
