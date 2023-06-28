// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import regions from "./jsons/regions.json";

interface Regions {
  [index: string]: string[];
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Regions>,
) {
  res.status(200).json(regions);
}
