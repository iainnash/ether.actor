import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Agent, addresses } from '@zoralabs/nft-metadata';
import { EthereumService } from 'src/ethereum/ethereum.service';
import { Cache } from 'cache-manager';
import { Contract, JsonRpcBatchProvider } from 'nestjs-ethers';

@Injectable()
export class NftService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(EthereumService) private ethereum: EthereumService,
  ) {}

  async getSupportedContracts(): Promise<object> {
    // ethers provider network name to network id
    const networks = {};
    Object.values(addresses).forEach((addressesByNetwork) => {
      Object.keys(addressesByNetwork).forEach((network) => {
        if (!networks[network]) {
          networks[network] = [];
        }
        networks[network].push(addressesByNetwork[network]);
      });
    });
    return networks;
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

    const data = await Promise.all([
      nftMethods.functions.ownerOf(tokenId),
      nftMethods.functions.name(),
      nftMethods.functions.symbol(),
    ]);

    const ownerOf = data[0][0];
    const name = data[1][0];
    const symbol = data[2][0];

    // @ts-ignore
    if (this.cacheManager.store.getClient) {
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
    }

    const nftAgent = new Agent({
      provider: batchProvider,
      timeout: 5000,
    });
    const agentResult = await nftAgent.fetchMetadata(address, tokenId);
    const result = {
      ...agentResult,
      owner: ownerOf,
      contract: {
        address,
        name,
        symbol,
      },
    };

    if (result) {
      this.cacheManager.set(cacheKey, result, { ttl: 60 * 5 });
    }
    return result;
  }
}
