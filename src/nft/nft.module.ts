import { Module } from '@nestjs/common';
import { CacheStoreModule } from 'src/cachestore/cachestore.module';
import { EthereumModule } from 'src/ethereum/ethereum.module';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';

@Module({
  providers: [NftService],
  exports: [NftService],
  controllers: [NftController],
  imports: [
    EthereumModule,
    CacheStoreModule,
  ]
})
export class NftModule {}