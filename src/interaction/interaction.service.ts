import { BadRequestException, CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { EthereumService } from 'src/ethereum/ethereum.service';
import { Cache } from 'cache-manager';
import { AbiService } from 'src/abi/abi.service';
import { utils, BigNumber, Contract } from 'ethers';

@Injectable()
export class InteractionService {
  constructor(
    @Inject(AbiService) private abiService: AbiService,
    @Inject(EthereumService) private ethereum: EthereumService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getContractData(
    addressInput: string,
    fnname: string,
    args: string[],
    host: string,
  ): Promise<any> {
    const networkId = this.ethereum.getNetworkId(host);
    const address = utils.getAddress(addressInput);
    const abiObject = await this.abiService.getAbi(address, networkId);
    const contract = new Contract(
      address,
      (abiObject as any).abi,
      this.ethereum.getRpcService(networkId),
    );
    try {
      const result = await contract[fnname](...args);

      try {
        // @ts-ignore
        const redisStore = this.cacheManager.store.getClient();
        await redisStore.incr('hits');
        await redisStore.incr(`hits:${networkId}`);
        await redisStore.incr(`hits:${networkId}:${address}`);
      } catch (e: any) {
        console.log('has analytics error', e);
        // ignore error with analytics
      }

      if (result instanceof BigNumber) {
        return result.toString();
      }
      if (Array.isArray(result)) {
        return result.map((item: any) =>
          item instanceof BigNumber ? item.toString() : item,
        );
      }
      return result;
    } catch (err) {
      console.error(err);
      throw new BadRequestException(
        {
          statusCode: 400,
          ...err,
        },
        err.reason,
      );
    }
  }
}
