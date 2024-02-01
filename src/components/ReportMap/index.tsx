import dynamic from "next/dynamic";
import { ComponentType } from "react";

const ReportMap: ComponentType = dynamic(() => import("./ReportMap"), {
  ssr: false,
});

export default ReportMap;
