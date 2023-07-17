import { Module } from '@nestjs/common';
import {
  EthersModule,
  GOERLI_NETWORK,
  MAINNET_NETWORK,
  MUMBAI_NETWORK,
  BINANCE_NETWORK,
  SEPOLIA_NETWORK,
  POLYGON_NETWORK,
  OPTIMISM_GOERLI_NETWORK,
} from 'nestjs-ethers';
import { EthereumService } from './ethereum.service';
import {
  OPTIMISM_CHAIN,
  ZORA_CHAIN,
  ZORA_GOERLI_CHAIN,
} from 'src/constants/chainid';

const NETWORK_CONFIGS = JSON.parse(process.env.RPC_NETWORK_CONFIGS);

@Module({
  providers: [EthereumService],
  exports: [EthereumService],
  imports: [
    EthersModule.forRoot({
      token: 'ether',
      network: MAINNET_NETWORK.chainId,
      custom: NETWORK_CONFIGS.mainnet,
      useDefaultProvider: false,
    }),
    EthersModule.forRoot({
      token: 'mumbai',
      network: MUMBAI_NETWORK.chainId,
      custom: NETWORK_CONFIGS.mumbai,
      useDefaultProvider: false,
    }),
    EthersModule.forRoot({
      token: 'polygon',
      network: POLYGON_NETWORK.chainId,
      custom: NETWORK_CONFIGS.polygon,
      useDefaultProvider: false,
    }),
    EthersModule.forRoot({
      token: 'bsc',
      network: BINANCE_NETWORK.chainId,
      custom: NETWORK_CONFIGS.bsc || 'https://bscrpc.com',
      useDefaultProvider: false,
    }),
    EthersModule.forRoot({
      token: 'bsc-testnet',
      custom:
        NETWORK_CONFIGS.bsc_testnet ||
        'https://data-seed-prebsc-1-s1.binance.org:8545',
    }),
    EthersModule.forRoot({
      token: 'goerli',
      network: GOERLI_NETWORK,
      custom: NETWORK_CONFIGS.goerli || 'https://goerli.prylabs.net',
      useDefaultProvider: false,
    }),
    EthersModule.forRoot({
      token: 'sepolia',
      network: SEPOLIA_NETWORK,
    }),
    EthersModule.forRoot({
      token: 'goerli-optimism',
      network: OPTIMISM_GOERLI_NETWORK,
      useDefaultProvider: true,
    }),
    EthersModule.forRoot({
      token: 'optimism',
      network: {
        chainId: OPTIMISM_CHAIN,
        name: 'optimism',
      },
      custom: NETWORK_CONFIGS.optimism || 'https://mainnet.optimism.io',
      useDefaultProvider: false,
    }),
    EthersModule.forRoot({
      token: 'zora',
      network: {
        chainId: ZORA_CHAIN,
        name: 'zora',
      },
      custom: 'https://rpc.zora.energy',
      useDefaultProvider: false,
    }),
    EthersModule.forRoot({
      token: 'zora-goerli',
      network: {
        chainId: ZORA_GOERLI_CHAIN,
        name: 'zora',
      },
      custom: 'https://testnet.rpc.zora.energy',
      useDefaultProvider: false,
    }),
  ],
})
export class EthereumModule {}
