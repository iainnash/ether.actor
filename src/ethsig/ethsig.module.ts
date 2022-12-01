import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CacheStoreModule } from 'src/cachestore/cachestore.module';
import { EthsigService } from './ethsig.service';

@Module({
  providers: [EthsigService],
  exports: [EthsigService],
  imports: [
    CacheStoreModule,
    HttpModule,
  ],
})
export class EthsigModule {}
