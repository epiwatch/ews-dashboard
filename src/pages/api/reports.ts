// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Report = {
  id: number,
  diseases?: string | null,
  syndromes?: string | null,
  location: string,
  title: string,
  publication_date: string,
  url: string
};

const reports: Report[] = [
  { id: 1, diseases: null, syndromes: "rash and fever", location: "Sydney, New South Wales, Australia", title: "Test 1", publication_date: "2023-01-01", url: "https://www.epiwatch.org"},
  { id: 2, diseases: "monkeypox", syndromes: null, location: "Melbourne, Victoria, Australia", title: "Test 2", publication_date: "2023-01-02", url: "https://www.epiwatch.org/about"},
  { id: 3, diseases: "covid19", syndromes: "fever", location: "Auckland, New Zealand", title: "Test 3", publication_date: "2023-01-03", url: "https://www.epiwatch.org/episcope"}
];

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Report[]>
) {
  res.status(200).json(reports);
}
