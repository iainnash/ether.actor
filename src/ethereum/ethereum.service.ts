import { Injectable, NotFoundException } from '@nestjs/common';
import {
  EtherscanProvider,
  InjectEthersProvider,
  MAINNET_NETWORK,
  MATIC_NETWORK,
  MUMBAI_NETWORK,
  RINKEBY_NETWORK,
  StaticJsonRpcProvider,
} from 'nestjs-ethers';

const ERC20_ABI = require('erc-token-abis/abis/ERC20Base.json');
const ERC721BASE_ABI = require('erc-token-abis/abis/ERC721Base.json');
const ERC721FULL_ABI = require('erc-token-abis/abis/ERC721Full.json');
const ERC1155Base_ABI = require('erc-token-abis/abis/ERC1155Base.json');

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
  throw new Error('no more chains');
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

  getRpcService(networkId: number) {
    return this.getProviderFromNetworkId(networkId);
  }
}
