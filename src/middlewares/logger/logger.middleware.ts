import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');
  use(req: Request, res: Response, next: NextFunction) {
    const now = new Date();
    const formattedTime = now.toISOString();
    const apiRequestDetails = {
      time: formattedTime,
      method: req.method,
      url: req.url,
    };
    this.logger.log(apiRequestDetails);
    const startTime = Date.now(); // to keep track of the request lifecycle/time
    res.on('finish', () => {
      const { statusCode } = res;
      const duration = Date.now() - startTime;
      this.logger.log(
        `${apiRequestDetails.method} ${apiRequestDetails.url} ${statusCode} - ${duration}ms -IP: ${req.ip}`,
      );
    });
    next();
  }
}
