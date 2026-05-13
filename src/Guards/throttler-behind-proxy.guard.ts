import { ThrottlerGuard } from '@nestjs/throttler';
import { Injectable } from '@nestjs/common';

interface RequestWithIps extends Record<string, any> {
  ip?: string;
  ips?: string[];
}

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
  protected getTracker(req: RequestWithIps): Promise<string> {
    return Promise.resolve(
      req.ips?.length ? req.ips[0] : (req.ip ?? 'unknown'),
    );
  }
}
