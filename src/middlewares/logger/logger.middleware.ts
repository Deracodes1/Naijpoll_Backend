import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');
  use(req: Request, res: any, next: () => void) {
    const now = new Date();
    const formattedTime = now.toISOString();
    const apiRequestDetails = {
      time: formattedTime,
      method: req.method,
      url: req.url,
    };
    this.logger.log(apiRequestDetails);
    next();
  }
}
