import * as React from "react";
import PublicLayout from "@/layouts/layout";
import type { AppProps } from "next/app";

const EpiwatchApp = ({ Component, pageProps }: AppProps) => {

  return (
    <PublicLayout>
      <Component {...pageProps} />
    </PublicLayout>
  );
};

export default EpiwatchApp;