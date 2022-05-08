import { Module } from '@nestjs/common';
import {
  EthersModule,
  GOERLI_NETWORK,
  MAINNET_NETWORK,
  MATIC_NETWORK,
  MUMBAI_NETWORK,
  RINKEBY_NETWORK,
  ROPSTEN_NETWORK,
} from 'nestjs-ethers';
import { EthereumService } from './ethereum.service';

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
      token: 'rinkeby',
      network: RINKEBY_NETWORK.chainId,
      custom: NETWORK_CONFIGS.rinkeby,
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
      network: MATIC_NETWORK.chainId,
      custom: NETWORK_CONFIGS.polygon,
      useDefaultProvider: false,
    }),
    EthersModule.forRoot({
      token: 'goerli',
      network: GOERLI_NETWORK,
      custom: NETWORK_CONFIGS.goerli || 'https://goerli.prylabs.net',
      useDefaultProvider: false,
    }),
    EthersModule.forRoot({
      token: 'ropsten',
      network: ROPSTEN_NETWORK,
      custom: NETWORK_CONFIGS.ropsten,
    }),
    EthersModule.forRoot({
      token: 'kovan-optimism',
      network: {
        chainId: 69,
        name: 'kovan-optimism',
      },
      custom: NETWORK_CONFIGS.kovan_optimism || 'https://kovan.optimism.io',
      useDefaultProvider: false,
    }),
    EthersModule.forRoot({
      token: 'optimism',
      network: {
        chainId: 10,
        name: 'optimism',
      },
      custom: NETWORK_CONFIGS.optimism || 'https://mainnet.optimism.io',
      useDefaultProvider: false,
    }),
  ],
})
export class EthereumModule {}
