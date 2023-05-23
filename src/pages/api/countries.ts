// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import countries from "./jsons/countries.json";
import { Country } from "@/types";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Country[]>
) {
  res.status(200).json(countries);
}
