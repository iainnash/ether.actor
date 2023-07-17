import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import hljs from 'highlight.js/lib/common';
const { solidity } = require('highlightjs-solidity');
import { EthereumService } from 'src/ethereum/ethereum.service';
import { utils } from 'ethers';
import { FormatTypes, Interface } from '@ethersproject/abi';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Contract } from '@ethersproject/contracts';
import { Provider } from '@ethersproject/providers';
import { AddressZero } from '@ethersproject/constants';
import { getAddress, isAddress } from '@ethersproject/address';

hljs.registerLanguage('solidity', solidity);

const ERC20_ABI = require('erc-token-abis/abis/ERC20Base.json');
const ERC721BASE_ABI = require('erc-token-abis/abis/ERC721Base.json');
const ERC721FULL_ABI = require('erc-token-abis/abis/ERC721Full.json');
const ERC1155Base_ABI = require('erc-token-abis/abis/ERC1155Base.json');

const EIP1967_PROXY_STORAGE_SLOT =
  '0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc';

const BYTES32_ZERO =
  '0x0000000000000000000000000000000000000000000000000000000000000000';

const HTML_START = `
<!DOCTYPE HTML>
<head>
<title>contract</title>
<link rel="stylesheet"
      href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/default.min.css">
<style>
body {
  font-family: courier new;
  white-space: pre;
}
</style>
</head>
<body>
`;

const HTML_END = `
</body>
</html>
`;

function highlightCode(code: string) {
  return hljs.highlight(code, { language: 'solidity' }).value;
}

const getHumanAbi = (abi: string) =>
  new Interface(abi).format(FormatTypes.full);

@Injectable()
export class AbiService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(EthereumService) private ethereum: EthereumService,
  ) {}

  async getKnownContractActions(
    address: string,
    rpcService: Provider,
  ): Promise<object> {
    const guesserMethods = new Contract(
      address,
      [
        'function supportsInterface(bytes4 interfaceID) external view returns (bool)',
        'function approve(address _spender, uint256 _value) public returns (bool success)',
      ],
      rpcService,
    );
    // erc721
    try {
      if (await guesserMethods.supportsInterface('0x780e9d63')) {
        return ERC721FULL_ABI;
      }
      if (await guesserMethods.supportsInterface('0x80ac58cd')) {
        return ERC721BASE_ABI;
      }
      if (await guesserMethods.supportsInterface('0xd9b67a26')) {
        return ERC1155Base_ABI;
      }
    } catch {
      // ignore
    }

    try {
      await guesserMethods.callStatic.approve(AddressZero, '1');
      return ERC20_ABI;
    } catch {
      return undefined;
    }
  }

  async getAbiFromHost(address: string, host: string): Promise<object> {
    return this.getAbi(address, this.ethereum.getNetworkId(host));
  }

  async getAbi(address: string, networkId: number): Promise<object> {
    if (!isAddress(address)) {
      throw new NotFoundException('Not an valid address');
    }
    address = getAddress(address);
    const cacheKey = `${networkId}:source:${address.toLowerCase()}`;
    // const abi = await this.cacheManager.get<object>(cacheKey);
    // if (abi) {
    //   return abi;
    // }
    const ethereumProvider = this.ethereum.getRpcService(networkId);
    try {
      const code = await ethereumProvider.getCode(address);
      if (!code) {
        throw new NotFoundException('No contract found at address');
      }

      let fetchedAddress = address as string;
      let impl;

      if (code.length === 92) {
        const proxy = code.match(
          /^0x363d3d373d3d3d363d73([a-z0-9]{40})5af43d82803e903d91602b57fd5bf3/,
        );
        if (proxy && proxy.length === 2) {
          impl = `0x${proxy[1]}`;
        }
      } else {
        // Only handles EIP1967 proxy slots – does not handle minimal proxies (EIP11)
        const proxyAddress = await ethereumProvider.getStorageAt(
          address,
          EIP1967_PROXY_STORAGE_SLOT,
        );
        if (proxyAddress != BYTES32_ZERO) {
          impl = utils.hexZeroPad(utils.stripZeros(proxyAddress), 20);
        }
      }

      let etherscanResult: any = undefined;
      let originalResult: any = undefined;

      const etherscanProvider = this.ethereum.getEtherscanProvider(networkId);
      if (!impl) {
        etherscanResult = await this.ethereum.getContractInfoEtherscan(
          etherscanProvider,
          address,
        );
        originalResult = etherscanResult;
        if (!impl) {
          impl = etherscanResult.info.Implementation;
        }
      }

      if (impl) {
        etherscanResult = await this.ethereum.getContractInfoEtherscan(
          etherscanProvider,
          impl,
        );
      }

      let { abi, ...contractResult } = etherscanResult;
      if (originalResult && impl && etherscanResult) {
        let etherscanKeys = etherscanResult.abi.map((item) => item.name);
        abi = [
          ...originalResult.abi.filter(
            (item) =>
              ['function', 'event', 'error'].includes(item.type) &&
              !etherscanKeys.includes(item.name),
          ),
          ...etherscanResult.abi,
        ];
      }
      // let abi = contractAbi;
      // if (proxyResult) {
      //   abi = [...abi, ...proxyResult.abi];
      // }

      let constructorArgsPretty;
      try {
        constructorArgsPretty = new Interface(abi).decodeFunctionData(
          '0x00000000',
          contractResult.info.ConstructorArguments,
        );
      } catch (e) {}

      const result = {
        constructorArgsPretty,
        info: contractResult.info,
        source: contractResult.source,
        guessFromInterface: false,
        iface: [...getHumanAbi(abi)],
        abi,
      };
      await this.cacheManager.set(cacheKey, result, impl ? 100 : 0);
      return result;
    } catch (err) {
      console.error(err);
      const guessKnownAbi = await this.getKnownContractActions(
        address,
        ethereumProvider,
      );
      if (!guessKnownAbi) {
        throw new NotFoundException('Contract not verified');
      }
      return {
        guessFromInterface: true,
        abi: guessKnownAbi,
        iface: getHumanAbi(JSON.stringify(guessKnownAbi)),
      };
    }
  }

  async getSource(
    host: string,
    address: string,
    isHTML: boolean = false,
  ): Promise<string> {
    const abiResult: any = await this.getAbiFromHost(address, host);
    if (abiResult['guessFromInterface']) {
      throw new NotFoundException();
    }

    let innerCode = '';

    if (typeof abiResult.source === 'string') {
      innerCode = abiResult.source;
    } else {
      // @ts-ignore
      const { language, settings, sources } = abiResult.source;
      const langChunk = `// Lang: ${language}`;
      const optimizer = `// Settings: ${JSON.stringify(settings)}`;
      const sourceChunks = Object.keys(sources)
        .map(
          (sourcePart) =>
            `// ${sourcePart}\n` +
            (isHTML
              ? highlightCode(sources[sourcePart].content)
              : sources[sourcePart].content),
        )
        .join('\n');
      innerCode = [langChunk, sourceChunks, optimizer].join('\n');
    }

    return [isHTML ? HTML_START : '', innerCode, isHTML ? HTML_END : ''].join(
      '\n',
    );
  }
}
