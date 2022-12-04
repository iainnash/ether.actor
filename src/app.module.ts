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
import { DecodeModule } from './decode/decode.module';
import { EthsigService } from './ethsig/ethsig.service';
import { EthsigModule } from './ethsig/ethsig.module';
import { HttpModule } from '@nestjs/axios';
import { DecodeService } from './decode/decode.service';

@Module({
  imports: [
    HttpModule,
    DecodeModule,
    EthereumModule,
    EthsigModule,
    AbiModule,
    NftModule,
    CacheStoreModule,
    InteractionModule,
  ],
  controllers: [AppController],
  providers: [AppService, DecodeService, AbiService, EthereumService],
})
export class AppModule {}
