import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { utils } from 'ethers';
import { Interface } from '@ethersproject/abi';
import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EthsigService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(HttpService) private readonly httpService: HttpService,
  ) {}

  async getSignatureForTxn(txn: string) {
    const signature = utils.hexDataSlice(txn, 0, 4);
    const cacheKey = `openchain:sig:${signature}`;
    // let signatureData: any = await this.cacheManager.get(cacheKey);
    let signatureData: any = undefined;
    if (!signatureData) {
      const response = await firstValueFrom(
        this.httpService.get(`https://api.openchain.xyz/signature-database/v1/lookup`, {
          params: {
            function: signature,
          },
          responseType: 'json',
        }),
      );
      signatureData = response.data;

      this.cacheManager.set(cacheKey, signatureData, 1000);
    }

    const result = signatureData.result.function[signature];

    let decoded;
    for (const {name} of result) {
      try {
        const iface = new Interface([`function ${name}`]);
        decoded = {
          name,
          decoded: iface.decodeFunctionData(name, txn).map((t) => t.toString()),
          functionName: name.substring(0, name.indexOf('('))
        };
      } catch (e) {
        console.error(e);
      }
    }

    if (decoded) {
      return decoded;
    }

    throw new InternalServerErrorException();
  }
}
