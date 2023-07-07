import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  exports: [CacheModule],
  imports: [
    CacheModule.register({
      store: process.env.REDIS_URL ? redisStore : undefined,
      url: process.env.REDIS_URL,
    }),
  ],
})
export class CacheStoreModule {}
