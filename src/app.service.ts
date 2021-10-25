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
  Interface,
  FormatTypes,
  AddressZero,
} from 'nestjs-ethers';
import 'isomorphic-fetch';
import { Cache } from 'cache-manager';

const ERC20_ABI = require('erc-token-abis/abis/ERC20Base.json');
const ERC721BASE_ABI = require('erc-token-abis/abis/ERC721Base.json');
const ERC721FULL_ABI = require('erc-token-abis/abis/ERC721Full.json');
const ERC1155Base_ABI = require('erc-token-abis/abis/ERC1155Base.json');

// const STORAGE_SLOT_PROXY = '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
const getHumanAbi = (abi: string) =>
  new Interface(abi).format(FormatTypes.full);

@Injectable()
export class AppService {
  constructor(
    @InjectEthersProvider()
    private readonly ethersProvider: BaseProvider,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getKnownContractActions(address: string): Promise<object> {
    const guesserMethods = new Contract(
      address,
      [
        'function supportsInterface(bytes4 interfaceID) external view returns (bool)',
        'function approve(address _spender, uint256 _value) public returns (bool success)',
      ],
      this.ethersProvider,
    );
    // erc721
    try {
      if (await guesserMethods.supportsInterface('0x780e9d63')) {
        return ERC721FULL_ABI;
      }
      if (await guesserMethods.supportsInterface('0x80ac58cd')) {
        return ERC721BASE_ABI;
      }
      if (await guesserMethods.supportsInterface('0xd9b67a26')) {
        return ERC1155Base_ABI;
      }
    } catch {
      // ignore
    }
    try {
      await guesserMethods.callStatic.approve(AddressZero, '1');
      return ERC20_ABI;
    } catch {
      return undefined;
    }
  }

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
      // check impl provider
      // this.ethersProvider.getStorageAt(address, '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc')
      const etherscanProvider = new EtherscanProvider(
        this.ethersProvider.network,
        process.env.ETHERSCAN_API_KEY,
      );
      const abiResult = await etherscanProvider.fetch('contract', {
        action: 'getabi',
        address,
      });
      const result = {
        guessFromInterface: false,
        abi: JSON.parse(abiResult),
        iface: getHumanAbi(abiResult),
      };
      // doesn't ever expire
      await this.cacheManager.set(cacheKey, result, { ttl: 0 });
      return result;
    } catch (err) {
      console.error(err);
      const guessKnownAbi = await this.getKnownContractActions(address);
      if (!guessKnownAbi) {
        throw new NotFoundException('Contract not verified');
      }
      return {
        guessFromInterface: true,
        abi: guessKnownAbi,
        iface: getHumanAbi(JSON.stringify(guessKnownAbi)),
      };
    }
  }

  async fetchUrlContract(
    url: string,
  ): Promise<{ body: string; mime: string } | { error: boolean; url: string }> {
    try {
      if (url.startsWith('http:')) {
        const fetched = await fetch(url);
        const mime = fetched.headers.get('content-type');
        const body = await fetched.text();
        return { body, mime };
      }
      if (url.startsWith('data:')) {
        const commaIndex = url.indexOf(',');
        if (commaIndex === -1) {
          throw new Error('invalid data uri');
        }
        const data = url.substr(commaIndex + 1);
        const mimeData = url
          .substr(0, commaIndex + 1)
          .match(/^data:([^;,]+)(;base64)?,$/);
        return {
          body: mimeData.length > 2 && mimeData[2] === ';base64'
            ? Buffer.from(data, 'base64').toString('utf-8')
            : data,
          mime: mimeData[1],
        };
      }
      console.log(url);
    } catch (err: any) {
      console.error(err);
      return { error: true, url };
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

      try {
        // @ts-ignore
        const redisStore = this.cacheManager.store.getClient();
        await redisStore.incr('hits');
        await redisStore.incr(`hits:${address}`);
      } catch (e: any) {
        console.error(e);
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
