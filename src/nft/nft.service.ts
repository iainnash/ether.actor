import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Agent, addresses } from '@zoralabs/nft-metadata';
import { EthereumService } from 'src/ethereum/ethereum.service';
import { Cache } from 'cache-manager';
import { Contract, JsonRpcBatchProvider } from 'nestjs-ethers';

const networkIdToNFTMetadataNetwork = {
  1: 'ETH',
};
@Injectable()
export class NftService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(EthereumService) private ethereum: EthereumService,
  ) {}

  async getSupportedContracts(host: string): Promise<object> {
    const networkId = this.ethereum.getNetworkId(host);
    const provider = this.ethereum.getProviderFromNetworkId(networkId);
    const networkName = provider.network.name;
    return Object.keys(addresses)
      .map((addressKey) => addresses[addressKey][networkName])
      .filter((addressResult) => !!addressResult);
  }

  async getNFTInfo(
    host: string,
    address: string,
    tokenId: string,
  ): Promise<object> {
    const networkId = this.ethereum.getNetworkId(host);
    const provider = this.ethereum.getProviderFromNetworkId(networkId);
    const cacheKey = `nft:${networkId}:${address.toLowerCase()}:${tokenId}`;

    const batchProvider = new JsonRpcBatchProvider(
      provider.connection.url,
      networkId,
    );

    const nftMethods = new Contract(
      address,
      [
        'function ownerOf(uint256 tokenId) external view returns (address)',
        'function name() public view returns (string memory)',
        'function symbol() public view returns (string memory)',
      ],
      batchProvider,
    );

    const nftInfo = await Promise.all([
      nftMethods.ownerOf(tokenId),
      nftMethods.name(),
      nftMethods.symbol(),
    ]);

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

    const nftAgent = new Agent({
      provider: batchProvider,
      timeout: 5000,
    });
    const agentResult = await nftAgent.fetchMetadata(address, tokenId);
    const result = {
      ...agentResult,
      owner: nftInfo[0],
      contract: {
        address,
        name: nftInfo[1],
        symbol: nftInfo[2],
      },
    };

    if (result) {
      this.cacheManager.set(cacheKey, result, { ttl: 60 * 5 });
    }
    return result;
  }
}
