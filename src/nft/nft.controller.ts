import {
  Controller,
  Get,
  Headers,
  NotFoundException,
  Param,
  Response,
} from '@nestjs/common';
import { NftService } from './nft.service';

@Controller('/nft')
export class NftController {
  constructor(private readonly nftService: NftService) {}

  @Get('/:contract/:id.json')
  async getNft(
    @Param('contract') contract: string,
    @Param('id') id: string,
    @Headers('Host') host: string,
  ): Promise<object> {
    try {
      return await this.nftService.getNFTInfo(host, contract, id);
    } catch (e) {
      console.error(e);
      throw new NotFoundException();
    }
  }

  @Get('/:contract/:id/metadata.json')
  async getMetadata(
    @Param('contract') contract: string,
    @Param('id') id: string,
    @Headers('Host') host: string,
  ): Promise<object> {
    try {
      return ((await this.nftService.getNFTInfo(host, contract, id)) as any)
        .metadata;
    } catch (e) {
      console.error(e);
      throw new NotFoundException();
    }
  }

  @Get('/:contract/:id/content')
  async getContent(
    @Param('contract') contract: string,
    @Param('id') id: string,
    @Headers('Host') host: string,
    @Response() res: any,
  ): Promise<object> {
    try {
      const nftInfo = (await this.nftService.getNFTInfo(
        host,
        contract,
        id,
      )) as any;
      return res.redirect(nftInfo.contentURL);
    } catch (e) {
      console.error(e);
      throw new NotFoundException();
    }
  }

  @Get('/:contract/:id/image')
  async getImage(
    @Param('contract') contract: string,
    @Param('id') id: string,
    @Headers('Host') host: string,
    @Response() res: any,
  ): Promise<object> {
    try {
      const nftInfo = (await this.nftService.getNFTInfo(
        host,
        contract,
        id,
      )) as any;
      return res.redirect(nftInfo.imageURL);
    } catch (e) {
      console.error(e);
      throw new NotFoundException();
    }
  }
}
