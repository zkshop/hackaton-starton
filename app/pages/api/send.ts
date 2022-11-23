import { HttpStatusCode } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

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
    // call apis
    res.status(200).json({ message: "Success" });
  }
}
