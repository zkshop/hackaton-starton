import * as yup from "yup";
import { NOT_A_NUMBER, REQUIRED } from ".";

export const CONTRACT_BUILDER_SCHEMA = yup.object().shape({
  collectionName: yup.string().required(REQUIRED).min(0, NOT_A_NUMBER),
  symbol: yup.string().required(REQUIRED),
  ipfsURI: yup.string().required(REQUIRED),
  maxSupply: yup.number().required(REQUIRED).min(0, NOT_A_NUMBER),
  ownerAddress: yup.string().required(REQUIRED),
  startonApiKey: yup.string().required(REQUIRED),
  price: yup.number().required(REQUIRED).min(0, NOT_A_NUMBER),
});
