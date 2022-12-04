import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Agent, addresses } from '@zoralabs/nft-metadata';
import { EthereumService } from 'src/ethereum/ethereum.service';
import { Cache } from 'cache-manager';
import { Contract } from 'nestjs-ethers';

async function orDefault<T>(asyncCall: any, fallback: T) {
  try {
    return await asyncCall
  } catch {
    return fallback;
  }
}

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

    const nftMethods = new Contract(
      address,
      [
        // 721
        'function ownerOf(uint256 tokenId) external view returns (address)',
        // metadata
        'function name() public view returns (string memory)',
        'function symbol() public view returns (string memory)',
        // introspection
        'function supportsInterface(bytes4 interfaceId) returns (bool)',
        // metadata
        'function contractURI() returns (string)',
      ],
      provider,
    );

    const is1155 = await orDefault(nftMethods.supportsInterface('0x4e2312e0'), false);
    const owner = await orDefault(nftMethods.ownerOf(tokenId), undefined);
    const name = await orDefault(nftMethods.name(), undefined);
    const symbol = await orDefault(nftMethods.symbol(), undefined);
    const contractURI = await orDefault(nftMethods.contractURI(), undefined);

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
      provider,
      timeout: 5000,
    });
    const agentResult = await nftAgent.fetchMetadata(address, tokenId);
    const result = {
      ...agentResult,
      owner,
      is1155,
      contract: {
        address,
        name,
        symbol,
        contractURI
      },
    };

    if (result) {
      this.cacheManager.set(cacheKey, result, { ttl: 60 * 5 });
    }
    return result;
  }
}
