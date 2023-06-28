import * as React from "react";
import PublicLayout from "@/layouts/layout";
import type { AppProps } from "next/app";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/en-gb";

const EpiwatchApp = ({ Component, pageProps }: AppProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <PublicLayout>
        <Component {...pageProps} />
      </PublicLayout>
    </LocalizationProvider>
  );
};

export default EpiwatchApp;
