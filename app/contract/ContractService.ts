import BigNumber from "bignumber.js";
import { FormValues } from "../form";
import abi from "./abi";
import bytecode from "./bytecode";
import {
  NETWORK,
  NAME,
  COMPILER_VERSION,
  DEPLOY_FROM_BYTECODE_URL,
} from "./constants";
import { createStartonAPI } from "./createStartonApi";

const numberToWei = (num: number) =>
  new BigNumber(num).multipliedBy(new BigNumber(10).pow(18)).toString();

type ContractApi = {
  deploySmartContract(values: Omit<FormValues, "startonApiKey">): Promise<void>;
};

export function ContractService(apiKey: string): ContractApi {
  const starton = createStartonAPI(apiKey);

  return {
    deploySmartContract: async ({
      ownerAddress,
      collectionName,
      symbol,
      ipfsURI,
      maxSupply,
      startonKms,
      price,
    }) => {
      await starton.post(DEPLOY_FROM_BYTECODE_URL, {
        network: NETWORK,
        name: NAME,
        description: "",
        params: [
          collectionName,
          symbol,
          ipfsURI,
          maxSupply,
          ownerAddress,
          numberToWei(price),
          process.env.PAPER_KEY_MANAGER_ADDRESS,
        ],
        abi,
        bytecode,
        compilerVersion: COMPILER_VERSION,
        signerWallet: startonKms,
      });
    },
  };
}
