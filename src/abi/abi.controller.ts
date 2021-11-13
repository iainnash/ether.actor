import { Controller, Get, Header, Headers, Param, Req, Res } from '@nestjs/common';
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

  @Get('/:contract.html')
  @Header("Content-Type", "text/html")
  async getContractSourceHTML(
    @Param('contract') contract: string,
    @Headers('Host') host: string,
  ): Promise<string> {
    return await this.abiService.getSource(host, contract, true);
  }

  @Get('/:contract')
  @Header("Content-Type", "text/plain")
  async getContractSource(
    @Param('contract') contract: string,
    @Headers('Host') host: string,
  ): Promise<string> {
    return await this.abiService.getSource(host, contract, false);
  }


}
