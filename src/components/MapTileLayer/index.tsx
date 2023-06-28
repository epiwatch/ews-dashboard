import dynamic from "next/dynamic";

const ReportMap: any = dynamic(() => import("./MapTileLayer"), {
  ssr: false,
});

export default ReportMap;
