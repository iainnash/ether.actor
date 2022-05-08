import { Injectable, NotFoundException } from '@nestjs/common';
import {
  BINANCE_NETWORK,
  BINANCE_TESTNET_NETWORK,
  EtherscanProvider,
  InjectEthersProvider,
  MAINNET_NETWORK,
  MATIC_NETWORK,
  MUMBAI_NETWORK,
  RINKEBY_NETWORK,
  StaticJsonRpcProvider,
} from 'nestjs-ethers';

// const last = EtherscanProvider.prototype.getBaseUrl;
EtherscanProvider.prototype.getBaseUrl = function () {
  if (this.network.chainId === MUMBAI_NETWORK.chainId) {
    return 'https://api-mumbai.polygonscan.com/';
  }
  if (this.network.chainId === MATIC_NETWORK.chainId) {
    return 'https://api.polygonscan.com/';
  }
  if (this.network.chainId === MAINNET_NETWORK.chainId) {
    return 'https://api.etherscan.io/';
  }
  if (this.network.chainId === RINKEBY_NETWORK.chainId) {
    return 'https://api-rinkeby.etherscan.io/';
  }
  throw new Error('undefined chain');
};

@Injectable()
export class EthereumService {
  constructor(
    @InjectEthersProvider('ether')
    private readonly etherProvider: StaticJsonRpcProvider,
    @InjectEthersProvider('rinkeby')
    private readonly rinkebyProvider: StaticJsonRpcProvider,
    @InjectEthersProvider('mumbai')
    private readonly mumbaiProvider: StaticJsonRpcProvider,
    @InjectEthersProvider('polygon')
    private readonly polygonProvider: StaticJsonRpcProvider,
  ) {}

  getNetworkId(host: string) {
    const [first] = host.split('.');
    switch (first) {
      // ether for root domain, mainnet for subdomain
      case 'ether':
      case 'mainnet':
      case 'homestead':
        return MAINNET_NETWORK.chainId;
      case 'rinkeby':
        return RINKEBY_NETWORK.chainId;
      case 'mumbai':
        return MUMBAI_NETWORK.chainId;
      case 'polygon':
        return MATIC_NETWORK.chainId;
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
      case RINKEBY_NETWORK.chainId:
        return this.rinkebyProvider;
      case MUMBAI_NETWORK.chainId:
        return this.mumbaiProvider;
      case MATIC_NETWORK.chainId:
        return this.polygonProvider;
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
    if (SourceCode[0] == '[') {
      source = JSON.parse(SourceCode.substr(1, SourceCode.length - 2));
    }
    return { abi, source, info };
  }

  getRpcService(networkId: number) {
    return this.getProviderFromNetworkId(networkId);
  }
}
