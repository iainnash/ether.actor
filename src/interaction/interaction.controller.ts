import { Controller, Get, Headers, Param, Req, Res } from '@nestjs/common';
import { InteractionService } from './interaction.service';

@Controller()
export class InteractionController {
  constructor(private readonly interactionService: InteractionService) {}

  @Get('/:contract/:fnname*')
  async getContractCall(
    @Param('contract') contract: string,
    @Param('fnname') fnname: string,
    @Req() req: any,
    @Res() res: any,
    @Headers('Host') host: string,
  ): Promise<any> {
    let args = [];
    if (req.params['0'] && req.params['0'].length > 1) {
      args = req.params['0'].substr(1).split('/');
    }

    const result = await this.interactionService.getContractData(
      contract,
      fnname,
      args,
      host,
    );
    res.send(result);
  }
}
