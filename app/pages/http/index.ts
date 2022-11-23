import axios from "axios";
import { FormValues } from "../form";

type LocalApi = {
  sendContractBuilderForm(values: FormValues): Promise<void>;
};

export const local = axios.create({ baseURL: "/api" });

export function LocalApiService(): LocalApi {
  return {
    sendContractBuilderForm: async (values) => {
      await local.post("send", values);
    },
  };
}
