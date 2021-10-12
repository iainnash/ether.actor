import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/:contract/:fnname/:arg0')
  async getContractCall(
    @Param('contract') contract: string,
    @Param('fnname') fnname: string,
    @Param('arg0') arg0: string,
  ): Promise<object> {
    return this.appService.getContractData(contract, fnname, arg0);
  }

  @Get('/:contract')
  async getAbiCall(
    @Param('contract') contract: string
  ): Promise<string> {
    return this.appService.getAbi(contract);
  }
}
