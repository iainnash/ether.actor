import {
  BadRequestException,
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InjectEthersProvider,
  BaseProvider,
  Contract,
  EtherscanProvider,
  BigNumber,
  isAddress,
} from 'nestjs-ethers';
import { Cache } from 'cache-manager';

@Injectable()
export class AppService {
  constructor(
    @InjectEthersProvider()
    private readonly ethersProvider: BaseProvider,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAbi(address: string): Promise<object> {
    if (!isAddress(address)) {
      throw new NotFoundException('Not an valid address');
    }
    const cacheKey = `abi:${address.toLowerCase()}`;
    const abi = await this.cacheManager.get<object>(cacheKey);
    if (abi) {
      return abi;
    }
    try {
      const code = await this.ethersProvider.getCode(address);
      if (!code) {
        throw new NotFoundException('No contract found at address');
      }
      const etherscanProvider = new EtherscanProvider(
        this.ethersProvider.network,
        process.env.ETHERSCAN_API_KEY,
      );
      const abiResult = await etherscanProvider.fetch('contract', {
        action: 'getabi',
        address,
      });
      const result = {
        abi: abiResult,
      };
      // doesn't ever expire
      await this.cacheManager.set(cacheKey, result, { ttl: 0 });
      return result;
    } catch (err) {
      console.error(err);
      throw new NotFoundException('Contract not verified');
    }
  }

  async getContractData(
    address: string,
    fnname: string,
    args: string[],
  ): Promise<any> {
    const abiObject = await this.getAbi(address);
    const contract = new Contract(
      address,
      (abiObject as any).abi,
      this.ethersProvider,
    );
    try {
      const result = await contract[fnname](...args);
      if (result instanceof BigNumber) {
        return result.toString();
      }
      return result.map((item: any) =>
        item instanceof BigNumber ? item.toString() : item,
      );
    } catch (err) {
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
