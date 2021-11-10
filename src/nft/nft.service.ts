import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Agent } from '@zoralabs/nft-metadata';
import { EthereumService } from 'src/ethereum/ethereum.service';
import { Cache } from 'cache-manager';

@Injectable()
export class NftService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(EthereumService) private ethereum: EthereumService,
  ) {}

  async getNFTInfo(
    host: string,
    address: string,
    tokenId: string,
  ): Promise<object> {
    const networkId = this.ethereum.getNetworkId(host);
    const cacheKey = `nft:${networkId}:${address.toLowerCase()}:${tokenId}`;

    try {
      // @ts-ignore
      const redisStore = this.cacheManager.store.getClient();
      await redisStore.incr('hits:nft');
      await redisStore.incr(`hits:${cacheKey}`);
    } catch (e) {
      console.error(e);
    }

    const exists = await this.cacheManager.get(cacheKey);
    if (exists) {
      return exists as any;
    }

    const provider = this.ethereum.getProviderFromNetworkId(networkId);
    const nftAgent = new Agent({
      network: networkId,
      networkUrl: provider.connection.url,
      timeout: 5000,
    });
    const result = await nftAgent.fetchMetadata(address, tokenId);
    if (result) {
      this.cacheManager.set(cacheKey, result, { ttl: 60 * 2 });
    }
    return result;
  }
}
