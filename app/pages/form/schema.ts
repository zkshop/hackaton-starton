import * as yup from "yup";
import { NOT_A_NUMBER, REQUIRED } from ".";

export const CONTRACT_BUILDER_SCHEMA = yup.object().shape({
  supply: yup.number().required(REQUIRED).min(0, NOT_A_NUMBER),
  price: yup.number().required(REQUIRED).min(0, NOT_A_NUMBER),
});
