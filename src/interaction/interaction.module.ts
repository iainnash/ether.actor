import { Module } from '@nestjs/common';
import { AbiModule } from 'src/abi/abi.module';
import { CacheStoreModule } from 'src/cachestore/cachestore.module';
import { EthereumModule } from 'src/ethereum/ethereum.module';
import { InteractionController } from './interaction.controller';
import { InteractionService } from './interaction.service';

@Module({
  providers: [InteractionService],
  exports: [InteractionService],
  controllers: [InteractionController],
  imports: [
    AbiModule,
    EthereumModule,
    CacheStoreModule,
  ]
})
export class InteractionModule {}