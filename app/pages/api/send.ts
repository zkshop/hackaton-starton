import { HttpStatusCode } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { ContractService } from "../contract";
import { FormValues } from "../form";

type Data = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    res
      .status(HttpStatusCode.MethodNotAllowed)
      .json({ message: "Wrong Method" });
  } else {
    try {
      const { startonApiKey, ...values } = req.body as FormValues;

      const contract = ContractService(startonApiKey);

      await contract.deploySmartContract(values);
      res.status(200).json({ message: "Success" });
    } catch (error) {
      console.error(error);
      // @ts-ignore
      res.status(500).json({ error });
    }
  }
}
