import {
  CacheInterceptor,
  CacheTTL,
  Controller,
  Get,
  Param,
  Req,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
// @UseInterceptors(CacheInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/:contract/:fnname*')
  // @CacheTTL(60)
  async getContractCall(
    @Param('contract') contract: string,
    @Param('fnname') fnname: string,
    @Req() req: any,
    @Res() res: any,
  ): Promise<any> {
    let args = [];
    if (req.params['0'] && req.params['0'].length > 1) {
      args = req.params['0'].substr(1).split('/');
    }

    const hasFetch = 'fetch' in req.query;

    const result = await this.appService.getContractData(
      contract,
      fnname,
      args,
    );
    if ('fetch' in req.query) {
      try {
        const fetchResult = await this.appService.fetchUrlContract(
          result.toString(),
        );
        if ('error' in fetchResult) {
          res.status(500).send(result);
          return;
        }
        res.header('content-type', fetchResult.mime);
        res.send(fetchResult.body);
        return;
        // return fetchResult.body;
      } catch {}
    }
    res.send(result);
  }

  @Get('/:contract.json')
  async getAbiCall(@Param('contract') contract: string): Promise<object> {
    return await this.appService.getAbi(contract);
  }

  // @Get('/:contract')
  // async getAbiHumanCall(@Param('contract') contract: string): Promise<string> {
  //   const abiResult = await this.appService.getAbi(contract);

  // }

  @Get('/')
  getHomepage(): string {
    return `
<!DOCTYPE HTML>
<html>
<head>
<title>ether.actor</title>
<style>
body {
  font-family: helvetica;
  max-width: 500px;
  margin: 10vh auto;
  color: #333;
}
li {
  margin-bottom: 20px;
}
</style>
</head>
<body>
<h2>super simple ethereum -> http bridge for fetching contract info</h2>
<p>powered by etherscan for ABIs and cloudflare for ethereum endpoints<p>
<br />
<p>try it:</p>
<ul>
<li><a href="/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63.json">/0xcontract</a><br />
returns the ABI of the given contract (in human-readable and raw abi format)</li>

<li><sup>new</sup> the abi returned for un-verified contracts is a best-guess given the ERC165 spec and common conventions. working to improve these matches soon. you can read from unverified ERC20 and ERC721 tokens</li>

<li><a href="/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63/tokenURI/23">/0xcontract/methodName/arg0</a><br />
returns the result of the given function call</li>

<li><a href="/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63/tokenSvgDataOf/233">/0xcontract/methodName/arg0</a><br />
returns the result of the given function call (works for media too)</li>

<li><a href="/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63/isApprovedForAll/0x18C8dF1fb7FB44549F90d1C2BB1DC8b690CD0559/0xd2d5cb7545685019a85601a0d279b24df019ec5e">/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63/isApprovedForAll/0xADDRESS0/0xADDRESS1</a>
<br />works with booleans and multiple arguments.
</ul>

</body>
</html>
    `;
  }
}
