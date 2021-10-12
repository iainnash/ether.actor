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
} from 'nestjs-ethers';
import { Cache } from 'cache-manager';


@Injectable()
export class AppService {
  constructor(
    @InjectEthersProvider()
    private readonly ethersProvider: BaseProvider,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getAbi(address: string): Promise<string> {
    const cacheKey = `abi:${address.toLowerCase()}`;
    const abi = await this.cacheManager.get<string>(cacheKey);
    if (abi) {
      return abi;
    }
    try {
      const etherscanProvider = new EtherscanProvider(
        this.ethersProvider.network,
        process.env.ETHERSCAN_API_KEY,
      );
      const result = await etherscanProvider.fetch('contract', {
        action: 'getabi',
        address,
      });
      // doesn't ever expire
      await this.cacheManager.set(cacheKey, result, {ttl: 0});
      return result;
    } catch (err) {
      console.error(err)
      throw new NotFoundException('Contract not verified');
    }
  }

  async getContractData(
    address: string,
    fnname: string,
    args: string[],
  ): Promise<object> {
    const abi = await this.getAbi(address);
    const contract = new Contract(address, abi, this.ethersProvider);
    try {
      return { data: await contract[fnname](...args) };
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
