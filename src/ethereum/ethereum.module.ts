import { Module } from '@nestjs/common';
import {
  EthersModule,
  MAINNET_NETWORK,
  MATIC_NETWORK,
  MUMBAI_NETWORK,
  RINKEBY_NETWORK,
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
  ],
})
export class EthereumModule {}
