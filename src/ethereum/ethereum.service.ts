import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BINANCE_NETWORK,
  BINANCE_TESTNET_NETWORK,
  GOERLI_NETWORK,
  InjectEthersProvider,
  MAINNET_NETWORK,
  POLYGON_NETWORK,
  MUMBAI_NETWORK,
} from 'nestjs-ethers';
import { EtherscanProvider, StaticJsonRpcProvider } from '@ethersproject/providers';
import { OPTIMISM_CHAIN, OPTIMISM_GOERLI_CHAIN, ZORA_CHAIN, ZORA_GOERLI_CHAIN, BASE_CHAIN, BASE_GOERLI_CHAIN, ARBITRUM_CHAIN } from 'src/constants/chainid';

// const last = EtherscanProvider.prototype.getBaseUrl;
EtherscanProvider.prototype.getBaseUrl = function () {
  if (this.network.chainId === MUMBAI_NETWORK.chainId) {
    return 'https://api-mumbai.polygonscan.com/';
  }
  if (this.network.chainId === POLYGON_NETWORK.chainId) {
    return 'https://api.polygonscan.com/';
  }
  if (this.network.chainId === GOERLI_NETWORK.chainId) {
    return 'http://api-goerli.etherscan.io/';
  }
  if (this.network.chainId === MAINNET_NETWORK.chainId) {
    return 'https://api.etherscan.io/';
  }
  if (this.network.chainId === BINANCE_NETWORK.chainId) {
    return 'https://api.bscscan.com/';
  }
  if (this.network.chainId === BINANCE_TESTNET_NETWORK.chainId) {
    return 'https://api-testnet.bscscan.com/';
  }
  if (this.network.chainId === ZORA_CHAIN) {
    return 'https://explorer.zora.energy';
  }
  if (this.network.chainId === ZORA_GOERLI_CHAIN) {
    return 'https://testnet.explorer.zora.energy';
  }
  if (this.network.chainId === OPTIMISM_CHAIN) {
    return 'https://api-optimistic.etherscan.io/';
  }
  if (this.network.chainId === OPTIMISM_GOERLI_CHAIN) {
    return 'https://api-goerli-optimistic.etherscan.io/';
  }
  if (this.network.chainId === OPTIMISM_GOERLI_CHAIN) {
    return 'https://api-goerli-optimistic.etherscan.io/';
  }
  if (this.network.chainId === BASE_GOERLI_CHAIN) {
    return 'https://api-goerli.basescan.org/';
  }
  if (this.network.chainId === BASE_CHAIN) {
    return 'https://api.basescan.org/';
  }
  if (this.network.chainId === ARBITRUM_CHAIN) {
    return 'https://api.arbiscan.io/';
  }

  throw new Error('undefined chain');
};

@Injectable()
export class EthereumService {
  constructor(
    @InjectEthersProvider('ether')
    private readonly etherProvider: StaticJsonRpcProvider,
    @InjectEthersProvider('mumbai')
    private readonly mumbaiProvider: StaticJsonRpcProvider,
    @InjectEthersProvider('polygon')
    private readonly polygonProvider: StaticJsonRpcProvider,
    @InjectEthersProvider('bsc')
    private readonly bscProvider: StaticJsonRpcProvider,
    @InjectEthersProvider('bsc-testnet')
    private readonly bscTestnetProvider: StaticJsonRpcProvider,
    @InjectEthersProvider('optimism')
    private readonly optimismProvider: StaticJsonRpcProvider,
    @InjectEthersProvider('goerli')
    private readonly goreliProvider: StaticJsonRpcProvider,
    @InjectEthersProvider('zora')
    private readonly zoraProvider: StaticJsonRpcProvider,
    @InjectEthersProvider('zora-goerli')
    private readonly zoraGoerliProvider: StaticJsonRpcProvider,
    @InjectEthersProvider('base')
    private readonly baseProvider: StaticJsonRpcProvider,
    @InjectEthersProvider('base-goerli')
    private readonly baseGoerliProvider: StaticJsonRpcProvider,
    @InjectEthersProvider('arbitrum')
    private readonly arbitrumProvider: StaticJsonRpcProvider,
  ) {}

  getNetworkId(host: string) {
    const [first] = host.split('.');
    switch (first) {
      // ether for root domain, mainnet for subdomain
      case 'ether':
      case 'mainnet':
      case 'homestead':
        return MAINNET_NETWORK.chainId;
      // case 'rinkeby':
      //   return RINKEBY_NETWORK.chainId;
      case 'optimism':
        return OPTIMISM_CHAIN;
      case 'kovan-optimism':
        return 69;
      case 'mumbai':
        return MUMBAI_NETWORK.chainId;
      case 'polygon':
        return POLYGON_NETWORK.chainId;
      case 'goerli':
        return GOERLI_NETWORK.chainId;
      // case 'ropsten':
      //   return ROPSTEN_NETWORK.chainId;
      case 'bsc':
        return BINANCE_NETWORK.chainId;
      case 'bsc-testnet':
        return BINANCE_TESTNET_NETWORK.chainId;
      case 'zora':
        return ZORA_CHAIN;
      case 'zora-goerli':
        return ZORA_GOERLI_CHAIN;
      case 'base':
        return BASE_CHAIN;
      case 'base-goerli':
        return BASE_GOERLI_CHAIN;
      case 'arbitrum':
        return ARBITRUM_CHAIN;
    }
    throw new NotFoundException();
  }

  getProviderFromNetworkId(networkId: number) {
    switch (networkId) {
      case MAINNET_NETWORK.chainId:
        return this.etherProvider;
      // case RINKEBY_NETWORK.chainId:
      //   return this.rinkebyProvider;
      case MUMBAI_NETWORK.chainId:
        return this.mumbaiProvider;
      case POLYGON_NETWORK.chainId:
        return this.polygonProvider;
      case BINANCE_NETWORK.chainId:
        return this.bscProvider;
      case BINANCE_TESTNET_NETWORK.chainId:
        return this.bscTestnetProvider;
      case GOERLI_NETWORK.chainId:
        return this.goreliProvider;
      // case ROPSTEN_NETWORK.chainId:
      //   return this.ropstenProvider;
      case ZORA_CHAIN:
        return this.zoraProvider;
      case ZORA_GOERLI_CHAIN:
        return this.zoraGoerliProvider;
      case OPTIMISM_CHAIN:
        return this.optimismProvider;
      case BASE_CHAIN:
        return this.baseProvider;
      case BASE_GOERLI_CHAIN:
        return this.baseGoerliProvider;
      case ARBITRUM_CHAIN:
        return this.arbitrumProvider;
    }
  }

  getEtherscanProvider(networkId: number) {
    const apiKey = JSON.parse(process.env.ETHERSCAN_API_KEYS_BY_NETWORK || '{}')[
      networkId
    ] || 'BLANK_API_KEY';
    const etherscanProvider = new EtherscanProvider(networkId, apiKey);
    return etherscanProvider;
  }

  async getContractInfoEtherscan(
    etherscanProvider: EtherscanProvider,
    address: string,
  ) {
    const sourceResult = await etherscanProvider.fetch('contract', {
      action: 'getsourcecode',
      address,
    });

    const { ABI, SourceCode, ...info } = sourceResult[0];
    const abi = JSON.parse(ABI);
    // Don't ask me why...
    let source = SourceCode;
    if (['[', '{'].includes(SourceCode[0])) {
      source = JSON.parse(SourceCode.substr(1, SourceCode.length - 2));
    }

    return { abi, source, info };
  }

  getRpcService(networkId: number) {
    return this.getProviderFromNetworkId(networkId);
  }
}
