import { Controller, Get, Header, Headers, Param, Req } from '@nestjs/common';
import { AbiService } from './abi.service';

@Controller()
export class AbiController {
  constructor(private readonly abiService: AbiService) {}

  @Get('/:contract.json')
  async getAbiCall(
    @Param('contract') contract: string,
    @Headers('Host') host: string,
  ): Promise<object> {
    return await this.abiService.getAbiFromHost(contract, host);
  }
}
