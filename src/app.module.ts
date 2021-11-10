import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AbiModule } from './abi/abi.module';
import { EthereumModule } from './ethereum/ethereum.module';
import { AbiService } from './abi/abi.service';
import { EthereumService } from './ethereum/ethereum.service';
import { CacheStoreModule } from './cachestore/cachestore.module';
import { NftModule } from './nft/nft.module';
import { InteractionModule } from './interaction/interaction.module';

@Module({
  imports: [
    EthereumModule,
    AbiModule,
    CacheStoreModule,
    NftModule,
    InteractionModule,
  ],
  controllers: [AppController],
  providers: [AppService, AbiService, EthereumService],
})
export class AppModule {}
