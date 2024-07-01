import * as React from "react";
import PublicLayout from "@/layouts/layout";
import type { AppProps } from "next/app";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { i18next_en } from "../locales/en/i18next.locale.en";
import { i18next_hi } from "../locales/hi/i18next.locale.hi";
import "dayjs/locale/hi";
import "dayjs/locale/en-gb";
import "../styles/globals.css";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

const locales = {
  en: i18next_en,
  hi: i18next_hi
};

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    resources: {
      en: {
        translation: locales.en
      },
      hi: {
        translation: locales.hi
      }
    }
  });

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
