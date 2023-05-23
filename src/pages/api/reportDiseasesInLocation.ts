// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import stats from "./jsons/stats_data.json";
import { DiseaseInLocations } from "@/types";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<DiseaseInLocations>
) {
  res.status(200).json(stats.reportDiseasesInLocation.response);
}
