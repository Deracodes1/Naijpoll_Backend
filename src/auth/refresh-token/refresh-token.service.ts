import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
// import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/redis/redis.module';

export interface RefreshTokenData {
  userId: string;
  tokenId: string;
}

@Injectable()
export class RefreshTokenService {
  constructor(
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Store refresh token in Redis with TTL matching JWT expiry
   */
  async store(userId: string, tokenId: string): Promise<void> {
    const ttl = this.getRefreshTtl();
    const key = this.key(userId, tokenId);

    await this.redis.setex(
      key,
      ttl,
      JSON.stringify({ createdAt: new Date().toISOString() }),
    );
  }

  /**
   * Check if refresh token exists and is valid
   */
  async validate(userId: string, tokenId: string): Promise<boolean> {
    const exists = await this.redis.exists(this.key(userId, tokenId));
    return exists === 1;
  }

  /**
   * Delete a specific refresh token (logout single device)
   */
  async revoke(userId: string, tokenId: string): Promise<void> {
    await this.redis.del(this.key(userId, tokenId));
  }

  /**
   * Delete ALL refresh tokens for a user (logout all devices)
   */
  async revokeAll(userId: string): Promise<void> {
    const pattern = `refresh:${userId}:*`;
    const stream = this.redis.scanStream({ match: pattern });

    const keys: string[] = [];
    stream.on('data', (resultKeys: string[]) => keys.push(...resultKeys));

    await new Promise<void>((resolve, reject) => {
      stream.on('end', () => resolve());
      stream.on('error', reject);
    });

    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  private key(userId: string, tokenId: string): string {
    return `refresh:${userId}:${tokenId}`;
  }

  private getRefreshTtl(): number {
    const expiry = this.configService.get<string>('REFRESH_EXPIRATION', '7d');
    return this.parseExpiry(expiry);
  }

  private parseExpiry(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1), 10);

    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800,
    };

    return value * (multipliers[unit] || 86400);
  }
}
