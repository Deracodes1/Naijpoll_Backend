import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis => {
        const url = configService.get<string>('REDIS_URL');
        if (!url) throw new Error('REDIS_URL required');

        return new Redis(url, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
// installing redis client via ioredis for easy redis interaction
// npm install ioredis
// npm install --save-dev @types/ioredis
