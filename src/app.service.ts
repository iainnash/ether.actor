import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { BASE_CHAIN, OPTIMISM_CHAIN, ZORA_CHAIN } from './constants/chainid';

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  async getStats() {
    // @ts-ignore
    const redisStore = this.cacheManager.store.getClient();
    const [hits, hitsZora, hitsOptimism, hitsBase] = await redisStore.mget([
      'hits',
      `hits:${ZORA_CHAIN}`,
      `hits:${OPTIMISM_CHAIN}`,
      `hits:${BASE_CHAIN}`,
    ]);
    return {hits, hitsOpStack: hitsZora + hitsOptimism + hitsBase};
  }
}
