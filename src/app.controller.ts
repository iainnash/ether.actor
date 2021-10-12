import { CacheTTL, Controller, Get, Param, Req, Request } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/:contract/:fnname*')
  @CacheTTL(25)
  async getContractCall(
    @Param('contract') contract: string,
    @Param('fnname') fnname: string,
    @Req() req: any,
  ): Promise<object> {
    let args = [];
    if (req.params['0'] && req.params['0'].length > 1) {
      args = req.params['0'].substr(1).split('/');
    }

    return this.appService.getContractData(contract, fnname, args);
  }

  @Get('/:contract')
  async getAbiCall(@Param('contract') contract: string): Promise<string> {
    return this.appService.getAbi(contract);
  }
}
