import { Inject, Injectable } from '@nestjs/common';
import { BASE_CHAIN, OPTIMISM_CHAIN, ZORA_CHAIN } from './constants/chainid';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { promisify } from 'util';

@Injectable()
export class AppService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async getStats() {
    // @ts-ignore
    const redisStore = this.cacheManager.store.getClient();

    if (!redisStore) {
      throw new Error('missing store');
    }

    const mget = promisify(redisStore.MGET).bind(redisStore);

    const [hits, zoraHits, optHits, baseHits] = await mget([
      'hits',
      `hits:${ZORA_CHAIN}`,
      `hits:${OPTIMISM_CHAIN}`,
      `hits:${BASE_CHAIN}`,
    ]);
    return {hits, opStackHits: zoraHits + optHits + baseHits};
  }
}
