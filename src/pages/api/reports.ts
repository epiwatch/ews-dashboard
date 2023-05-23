// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Report = {
	id: number;
	diseases?: string | null;
	syndromes?: string | null;
	location: string;
	date: string;
};

const reports: Report[] = [
  {
    id: 1,
    diseases: null,
    syndromes: "rash and fever",
    location: "Australia",
    date: "2023-01-01",
  },
  {
    id: 2,
    diseases: "monkeypox",
    syndromes: null,
    location: "Australia",
    date: "2023-01-02",
  },
  {
    id: 3,
    diseases: "covid19",
    syndromes: "fever",
    location: "New Zealand",
    date: "2023-01-03",
  },
];

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Report[]>
) {
  res.status(200).json(reports);
}
