// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import MapData from "./jsons/map_data.json";
import { MapCountry } from "@/types";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<MapCountry[]>,
) {
  res.status(200).json(MapData);
}
