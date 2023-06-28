import dynamic from "next/dynamic";

const ReportMap: any = dynamic(() => import("./ReportMap"), {
  ssr: false,
});

export default ReportMap;
