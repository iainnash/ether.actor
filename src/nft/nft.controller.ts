import {
  Controller,
  Get,
  GoneException,
  Headers,
  NotFoundException,
  Param,
  Response,
} from '@nestjs/common';
import { uri } from '@zoralabs/nft-metadata';
import { NftService } from './nft.service';

function handleUrlResponse(url: string, res: any) {
  if (!url) {
    throw new GoneException();
  }
  if (url && url.startsWith('data:')) {
    const parsedUri = uri.parseDataUri(url);
    return res.header('content-type', parsedUri.mime).send(parsedUri.body);
  }
  return res.redirect(url);
}

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

  @Get('/contracts.json')
  async getContracts(): Promise<object> {
    return await this.nftService.getSupportedContracts();
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
    @Response() res: Response,
  ) {
    try {
      const nftInfo = (await this.nftService.getNFTInfo(
        host,
        contract,
        id,
      )) as any;
      handleUrlResponse(nftInfo.contentURL, res);
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
  ) {
    try {
      const nftInfo = (await this.nftService.getNFTInfo(
        host,
        contract,
        id,
      )) as any;
      handleUrlResponse(nftInfo.imageURL, res);
    } catch (e) {
      console.error(e);
      throw new NotFoundException();
    }
  }
}
