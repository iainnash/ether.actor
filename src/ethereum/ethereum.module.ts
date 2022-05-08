import { Module } from '@nestjs/common';
import {
  EthersModule,
  MAINNET_NETWORK,
  MATIC_NETWORK,
  MUMBAI_NETWORK,
  RINKEBY_NETWORK,
  BINANCE_TESTNET_NETWORK,
  BINANCE_NETWORK,
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
      token: 'bsc',
      network: BINANCE_NETWORK.chainId,
      custom: NETWORK_CONFIGS.bsc || 'https://bscrpc.com',
      useDefaultProvider: false,
    }),
    EthersModule.forRoot({
      token: 'bsc-testnet',
      network: MATIC_NETWORK.chainId,
      custom:
        NETWORK_CONFIGS.bsc_testnet ||
        'https://data-seed-prebsc-1-s1.binance.org:8545',
      useDefaultProvider: false,
    }),
  ],
})
export class EthereumModule {}
