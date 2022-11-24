import axios from "axios";
import { abi, bytecode } from "../../contract";
import { FormValues } from "../form";

type ContractApi = {
  deploySmartContract(values: Omit<FormValues, "startonApiKey">): Promise<void>;
};

export const createStartonAPI = (apiKey: string) => {
  return axios.create({
    baseURL: "https://api.starton.io",
    headers: {
      "x-api-key": apiKey,
    },
  });
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
      price,
    }) => {
      await starton.post("/v3/smart-contract/from-bytecode", {
        network: "polygon-mumbai",
        name: "dave-checkout",
        description: "",
        params: [
          collectionName,
          symbol,
          ipfsURI,
          maxSupply,
          ownerAddress,
          price,
          process.env.PAPER_KEY_MANAGER_ADDRESS,
        ],
        abi,
        bytecode,
        compilerVersion: "0.8.17",
        signerWallet: "0x5497871aFAbBfF5482BD89Fcf23f6D490386cD19",
      });
    },
  };
}
