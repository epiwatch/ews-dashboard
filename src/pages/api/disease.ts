// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import diseases from "./jsons/diseases.json";
import { Disease } from "@/types";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Disease[]>,
) {
  res.status(200).json(diseases);
}
