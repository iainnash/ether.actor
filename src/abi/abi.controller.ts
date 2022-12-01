import { Controller, Get, Header, Headers, Param, Req, Res } from '@nestjs/common';
import { AbiService } from './abi.service';

@Controller()
export class AbiController {
  constructor(private readonly abiService: AbiService) {}

  @Get('/0x:contract.json')
  async getAbiCall(
    @Param('contract') contract: string,
    @Headers('Host') host: string,
  ): Promise<object> {
    return await this.abiService.getAbiFromHost(contract, host);
  }

  @Get('/0x:contract/abi.json')
  async getRawAbiCall(
    @Param('contract') contract: string,
    @Headers('Host') host: string,
  ): Promise<object> {
    const resp = await this.abiService.getAbiFromHost(contract, host)
    return resp['abi'];
  }

  @Get('/0x:contract.html')
  @Header("Content-Type", "text/html")
  async getContractSourceHTML(
    @Param('contract') contract: string,
    @Headers('Host') host: string,
  ): Promise<string> {
    return await this.abiService.getSource(host, contract, true);
  }

  @Get('/0x:contract')
  @Header("Content-Type", "text/plain")
  async getContractSource(
    @Param('contract') contract: string,
    @Headers('Host') host: string,
  ): Promise<string> {
    return await this.abiService.getSource(host, contract, false);
  }


}
