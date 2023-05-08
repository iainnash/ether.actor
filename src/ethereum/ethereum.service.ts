import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BINANCE_NETWORK,
  BINANCE_TESTNET_NETWORK,
  GOERLI_NETWORK,
  POLYGON_NETWORK,
  InjectEthersProvider,
  MAINNET_NETWORK,
  MUMBAI_NETWORK,
  SEPOLIA_NETWORK,
} from 'nestjs-ethers';
import { EtherscanProvider, BaseProvider } from '@ethersproject/providers';

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
  // optimism
  if (this.network.chainId === 10) {
    return 'https://api-optimistic.etherscan.io/';
  }
  // kovan-optimism
  if (this.network.chainId === 69) {
    return 'https://api-kovan-optimistic.etherscan.io/';
  }

  throw new Error('undefined chain');
};

@Injectable()
export class EthereumService {
  constructor(
    @InjectEthersProvider('ether')
    private readonly etherProvider: BaseProvider,
    @InjectEthersProvider('mumbai')
    private readonly mumbaiProvider: BaseProvider,
    @InjectEthersProvider('sepolia')
    private readonly sepoliaProvider: BaseProvider,
    @InjectEthersProvider('polygon')
    private readonly polygonProvider: BaseProvider,
    @InjectEthersProvider('bsc')
    private readonly bscProvider: BaseProvider,
    @InjectEthersProvider('bsc-testnet')
    private readonly bscTestnetProvider: BaseProvider,
    @InjectEthersProvider('optimism')
    private readonly optimismProvider: BaseProvider,
    @InjectEthersProvider('kovan-optimism')
    private readonly kovanOptimismProvider: BaseProvider,
    @InjectEthersProvider('goerli')
    private readonly goreliProvider: BaseProvider,
  ) {}

  getNetworkId(host: string) {
    const [first] = host.split('.');
    switch (first) {
      // ether for root domain, mainnet for subdomain
      case 'ether':
      case 'mainnet':
      case 'homestead':
        return MAINNET_NETWORK.chainId;
      case 'optimism':
        return 10;
      case 'kovan-optimism':
        return 69;
      case 'mumbai':
        return MUMBAI_NETWORK.chainId;
      case 'polygon':
        return POLYGON_NETWORK.chainId;
      case 'sepolia':
        return SEPOLIA_NETWORK.chainId;
      case 'goerli':
        return GOERLI_NETWORK.chainId;
      case 'bsc':
        return BINANCE_NETWORK.chainId;
      case 'bsc-testnet':
        return BINANCE_TESTNET_NETWORK.chainId;
    }
    throw new NotFoundException();
  }

  getProviderFromNetworkId(networkId: number) {
    switch (networkId) {
      case MAINNET_NETWORK.chainId:
        return this.etherProvider;
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
      case SEPOLIA_NETWORK.chainId:
        return this.sepoliaProvider;
      case 69:
        return this.kovanOptimismProvider;
      case 10:
        return this.optimismProvider;
    }
  }

  getEtherscanProvider(networkId: number) {
    const apiKey = JSON.parse(process.env.ETHERSCAN_API_KEYS_BY_NETWORK)[
      networkId
    ];
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
