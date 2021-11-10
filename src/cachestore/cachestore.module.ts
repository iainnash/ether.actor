import { CacheModule, CACHE_MANAGER, Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  exports: [CacheModule],
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDISHOST,
      port: process.env.REDISPORT,
      user: process.env.REDISUSER,
      password: process.env.REDISPASSWORD,
    }), 
  ],
})
export class CacheStoreModule {}
