import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AbiService } from 'src/abi/abi.service';
import { utils } from 'ethers';
import { Interface } from 'nestjs-ethers';
import { EthsigService } from 'src/ethsig/ethsig.service';

@Injectable()
export class DecodeService {
  constructor(
    @Inject(AbiService) private abiService: AbiService,
    @Inject(EthsigService) private ethsig: EthsigService,
  ) {}

  async decodeBytecodeWithContract(
    host: string,
    contract: string,
    bytecodeString: string,
  ) {
    let abi;
    try {
      abi = await this.abiService.getAbiFromHost(contract, host);
    } catch (e) {

    }
    if (!abi) {
      const result = await this.ethsig.getSignatureForTxn(bytecodeString);
      return {
        ...result,
        isVerified: false,
      }
    }

    const result = new Interface(abi['abi']).parseTransaction({
      data: bytecodeString,
    });
    const args = result.args.map((item) => item.toString());
    const argMapping = result.functionFragment.inputs.reduce(
      (last: any, input: any, index: number) => {
        last[input.name] = {
          name: input.name,
          type: input.type,
          value: args[index],
        };
        return last;
      },
      {},
    );

    return {
      args: argMapping,
      name: result.signature,
      decoded: args,
      functionName: result.functionFragment.name,
      isVerified: true,
    };
  }

  async decodeBytecode(bytecodeString: string) {
    return await this.ethsig.getSignatureForTxn(bytecodeString);
  }

  parseBytecodeAsHex(bytecode: string) {
    try {
      return utils.arrayify(bytecode);
    } catch (err) {
      throw new BadRequestException('invalid bytecode');
    }
  }
}
