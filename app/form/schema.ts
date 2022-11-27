import * as yup from "yup";
import { NOT_A_NUMBER, REQUIRED } from ".";
import { LAST_CHARACTER_IS_NOT_SLASH } from "./constants";

export const CONTRACT_BUILDER_SCHEMA = yup.object().shape({
  collectionName: yup.string().required(REQUIRED).min(0, NOT_A_NUMBER),
  symbol: yup.string().required(REQUIRED),
  ipfsURI: yup.string().matches(/.*\/$/, LAST_CHARACTER_IS_NOT_SLASH).required(REQUIRED),
  maxSupply: yup.number().required(REQUIRED).min(0, NOT_A_NUMBER),
  ownerAddress: yup.string().required(REQUIRED),
  startonApiKey: yup.string().required(REQUIRED),
  startonKms: yup.string().required(REQUIRED),
  price: yup.number().required(REQUIRED).min(0, NOT_A_NUMBER),
});
