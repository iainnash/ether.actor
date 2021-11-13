import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import {
  AddressZero,
  Contract,
  FormatTypes,
  Interface,
  isAddress,
  Provider,
} from 'nestjs-ethers';
import hljs from 'highlight.js/lib/common';
const {solidity} = require('highlightjs-solidity');
import { EthereumService } from 'src/ethereum/ethereum.service';

hljs.registerLanguage('solidity', solidity);

const ERC20_ABI = require('erc-token-abis/abis/ERC20Base.json');
const ERC721BASE_ABI = require('erc-token-abis/abis/ERC721Base.json');
const ERC721FULL_ABI = require('erc-token-abis/abis/ERC721Full.json');
const ERC1155Base_ABI = require('erc-token-abis/abis/ERC1155Base.json');

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
`

const HTML_END = `
</body>
</html>
`;

function highlightCode(code: string) {
  return hljs.highlight(code, {language: 'solidity'}).value;
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
    const cacheKey = `${networkId}:source:${address.toLowerCase()}`;
    const abi = await this.cacheManager.get<object>(cacheKey);
    const ethereumProvider = this.ethereum.getRpcService(networkId);
    if (abi) {
      return abi;
    }
    try {
      const code = await ethereumProvider.getCode(address);
      if (!code) {
        throw new NotFoundException('No contract found at address');
      }

      const etherscanProvider = this.ethereum.getEtherscanProvider(networkId);
      const contractResult = await this.ethereum.getContractInfoEtherscan(etherscanProvider, address);
      const result = {
        guessFromInterface: false,
        iface: getHumanAbi(contractResult.abi),
        ...contractResult,
      };
      // doesn't ever expire
      await this.cacheManager.set(cacheKey, result, { ttl: 0 });
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

  async getSource(host: string, address: string, isHTML: boolean = false): Promise<string> {
    const abiResult = await this.getAbiFromHost(address, host);
    if (abiResult['guessFromInterface']) {
      throw new NotFoundException();
    }
    // @ts-ignore
    const {language, settings, sources} = abiResult.source;
    const langChunk = `// Lang: ${language}`
    const optimizer = `// Settings: ${JSON.stringify(settings)}`

    const sourceChunks = Object.keys(sources).map((sourcePart) => 
      `// ${sourcePart}\n`+
      isHTML ? highlightCode(sources[sourcePart].content) : `${sources[sourcePart].content}`
    ).join("\n");
    return [isHTML ? HTML_START : '', langChunk, sourceChunks, optimizer, isHTML ? HTML_END : ''].join("\n");
  }
}
