import { useMemo } from "react";
import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import Head from "next/head";
import Image from "next/image";
import { AgGridReact } from "ag-grid-react"; // the AG Grid React Component

import styles from "../styles/Home.module.css";
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS, always needed
import "ag-grid-community/styles/ag-theme-alpine.css"; // Optional theme CSS

const gridOptionsComponents = {
  colWithLoader: (params: any) => {
    if (params.value !== undefined) {
      return params.value;
    } else {
      return <Image src="/loader.gif" width={20} height={20} alt="loading" />;
    }
  },
  titleLinkCell: (params: any) => {
    if (params.value) {
      return <a className={styles.rowLink} target="_blank" href={encodeURI(params.data.url)}>{params.value}</a>;
    }
    return "";
  }
};

export default function Home({ rowData }: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const gridOptions = useMemo(() => ({
    components: gridOptionsComponents
  }), []);

  const defaultColDef = useMemo(() => ({
    resizable: true,
    minWidth: 150,
    sortable: true,
    floatingFilter: true,
    filter: "agTextColumnFilter",
    filterParams: { buttons: ["apply", "reset"], closeOnApply: true, filterOptions: ["contains", "equals"], suppressAndOrCondition: true, defaultOption: "contains" }
  }), []);

  const columnDefs = useMemo(() => [
    {
      field: "publication_date", width: 180, cellRenderer: "colWithLoader", headerName: "Publication Date", filter: "agDateColumnFilter",
      filterParams: {
        buttons: ["apply", "reset"],
        closeOnApply: true,
        filterOptions: ["equals", "lessThan", "greaterThan"],
        suppressAndOrCondition: true,
        defaultOption: "greaterThan",
        comparator: (filterLocalDateAtMidnight: Date, cellValue: string | null) => {
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
        }
      },
      // sort: 'asc'
    },
    { field: "diseases", flex: 1 },
    { field: "syndromes", flex: 1 },
    { field: "title", flex: 3, cellRenderer: "titleLinkCell" },
    { field: "location", flex: 2 }
  ], []);

  return (
    <>
      <Head>
        <title>Reports Table</title>
        <meta name="description" content="EPIWATCH Reports Table" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`ag-theme-alpine ${styles.reportsTable}`}>
        <AgGridReact
          rowData={rowData} // Row Data for Rows
          columnDefs={columnDefs} // Column Defs for Columns
          defaultColDef={defaultColDef} // Default Column Properties
          gridOptions={gridOptions}
          suppressMultiSort={true}
          animateRows={true} // Optional - set to 'true' to have rows animate when sorted
        />
      </div>
    </>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  context.res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=1000");
  const fetch_res = await fetch(process.env.NEXT_PUBLIC_API_URL + "/reports");
  let rowData = await fetch_res.json();

  return { props: { rowData } };
}