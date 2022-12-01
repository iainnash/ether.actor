import { Controller, Get, Header, Headers, Param } from '@nestjs/common';
import { DecodeService } from './decode.service';

@Controller()
export class DecodeController {
  constructor(
    private readonly decodeService: DecodeService
    ) {}

  @Get('/decode/:bytecode')
  async getRawAbiCall(
    @Param('bytecode') bytecode: string,
  ): Promise<object> {
    return await this.decodeService.decodeBytecode(bytecode)
  }

  @Get('/decode/0x:contract/:bytecode')
  async getAbiCall(
    @Param('contract') contract: string,
    @Param('bytecode') bytecode: string,
    @Headers('Host') host: string,
  ): Promise<object> {
    return await this.decodeService.decodeBytecodeWithContract(host, contract, bytecode);
  }

}
