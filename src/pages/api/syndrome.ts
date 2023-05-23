// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import syndromes from "./jsons/syndromes.json";
import { Syndrome } from "@/types";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Syndrome[]>
) {
  res.status(200).json(syndromes);
}
