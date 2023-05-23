// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import subregions from "./jsons/subregions.json";

interface Subregions {
	[index: string]: string[];
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Subregions>
) {
  res.status(200).json(subregions);
}
