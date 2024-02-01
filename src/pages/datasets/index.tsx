import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AgGridReact } from "ag-grid-react"; // the AG Grid React Component
import styles from "@/styles/Home.module.css";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS
import { OutputDataType } from "@/types";
import { RowSelectedEvent } from "ag-grid-community";
import { AG_GRID_LOCALE_EN } from "../../locales/en/ag-grid.locale.en";
import { AG_GRID_LOCALE_HI } from "../../locales/hi/ag-grid.locale.hi";
import { useTranslation } from "react-i18next";
import { checkLang } from "@/components/utils/dataUtils";

const ag_locales = {
  en: AG_GRID_LOCALE_EN,
  hi: AG_GRID_LOCALE_HI
};

const gridOptionsComponents = {
  colWithLoader: (params: OutputDataType) => {
    if (params.value !== undefined) {
      return params.value;
    } else {
      return <Image src="/loader.gif" width={20} height={20} alt="loading" />;
    }
  },
};

export default function Dataset() {
  const [rowData, setRowData] = useState([]);
  const { t, i18n } = useTranslation();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [localeText, setLocaleText] = useState<any>(null);

  const onGridReady = (params: RowSelectedEvent) => {
    params.api.showLoadingOverlay(); // Initially show loading overlay
  };

  useEffect(() => {
    initialLoad();
  }, []);

  const initialLoad = async () => {
    try {
      checkLang(i18n);
      setLocaleText(ag_locales[i18n.language as keyof typeof ag_locales]);
      const fetch_res = await fetch(
        process.env.NEXT_PUBLIC_API_URL + `/reports?lang=${i18n.language}`
      );
      const rowDataObj = await fetch_res.json();
      setRowData(rowDataObj);
    } catch (e: unknown) {
      console.log(e);
    }
  };

  const gridOptions = useMemo(
    () => ({
      components: gridOptionsComponents,
    }),
    [],
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      minWidth: 150,
      sortable: true,
      floatingFilter: true,
      filter: "agTextColumnFilter",
      filterParams: {
        buttons: ["apply", "reset"],
        closeOnApply: true,
        filterOptions: ["contains", "equals"],
        suppressAndOrCondition: true,
        defaultOption: "contains",
      },
    }),
    [],
  );

  const columnDefs = useMemo(
    () => [
      {
        field: "date",
        width: 180,
        cellRenderer: "colWithLoader",
        headerName: t("dataset.date_tag"),
        filter: "agDateColumnFilter",
        filterParams: {
          buttons: ["apply", "reset"],
          closeOnApply: true,
          filterOptions: ["equals", "lessThan", "greaterThan"],
          suppressAndOrCondition: true,
          defaultOption: "greaterThan",
          comparator: (
            filterLocalDateAtMidnight: Date,
            cellValue: string | null,
          ) => {
            const dateAsString = cellValue;

            if (dateAsString == null) {
              return 0;
            }

            // In the example application, dates are stored as dd/mm/yyyy
            // We create a Date object for comparison against the filter date
            const dateParts = dateAsString.split("-");
            const year = Number(dateParts[0]);
            const month = Number(dateParts[1]) - 1;
            const day = Number(dateParts[2]);
            const cellDate = new Date(year, month, day);

            // Now that both parameters are Date objects, we can compare
            if (cellDate < filterLocalDateAtMidnight) {
              return -1;
            } else if (cellDate > filterLocalDateAtMidnight) {
              return 1;
            }
            return 0;
          },
        }
      },
      { field: "diseases", headerName: t("dataset.diseases_tag"), flex: 1 },
      { field: "syndromes", headerName: t("dataset.syndromes_tag"), flex: 1 },
      { field: "location", headerName: t("dataset.location_tag"), flex: 2 },
    ],
    [t],
  );

  return (
    <div className={`ag-theme-alpine ${styles.reportsTable} body-borderless`}>
      <AgGridReact
        onGridReady={onGridReady}
        rowData={rowData} // Row Data for Rows
        columnDefs={columnDefs} // Column Defs for Columns
        defaultColDef={defaultColDef} // Default Column Properties
        gridOptions={gridOptions}
        suppressMultiSort={true}
        animateRows={true} // Optional - set to 'true' to have rows animate when sorted
        localeText={localeText}
      />
    </div>
  );
}
