import axios from "axios";
import { STARTON_API_URL, API_KEY_ATTRIBUTE } from "./constants";

export const createStartonAPI = (apiKey: string) => {
  return axios.create({
    baseURL: STARTON_API_URL,
    headers: {
      [API_KEY_ATTRIBUTE]: apiKey,
    },
  });
};
