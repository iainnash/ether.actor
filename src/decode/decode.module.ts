import { Module } from '@nestjs/common';
import { DecodeService } from './decode.service';
import { DecodeController } from './decode.controller';
import { AbiModule } from 'src/abi/abi.module';
import { EthsigModule } from 'src/ethsig/ethsig.module';

@Module({
  providers: [DecodeService],
  exports: [DecodeService],
  controllers: [DecodeController],
  imports: [EthsigModule, AbiModule],
})
export class DecodeModule {}
