import { Module } from '@nestjs/common';
import { AbiService } from './abi.service';
import { AbiController } from './abi.controller';
import { CacheStoreModule } from 'src/cachestore/cachestore.module';
import { EthereumModule } from 'src/ethereum/ethereum.module';

@Module({
  providers: [AbiService],
  exports: [AbiService],
  controllers: [AbiController],
  imports: [
    EthereumModule,
    CacheStoreModule,
  ]
})
export class AbiModule {}