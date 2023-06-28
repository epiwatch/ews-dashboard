/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  CategoryScale,
  LinearScale,
} from "chart.js";
import Grid from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Button, FormGroup, FormControlLabel, Switch } from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import LinearProgress from "@mui/material/LinearProgress";
import dayjs, { Dayjs } from "dayjs";
import styles from "@/styles/Stats.module.css";
import {
  LegendColours,
  DateFormat,
  FetchDataDateFormat,
} from "../../components/utils/constant";
import BarChart from "../../components/stats/BarChart";
import PieChart from "../../components/stats/PieChart";
import BarChartLegend from "../../components/stats/BarChartLegend";
import {
  transformData,
  transferColorProperty,
} from "../../components/utils/dataUtils";

import {
  Country,
  Disease,
  Syndrome,
  DiseaseInLocations,
  PieChartDatasetsItem,
  BarChartDatasetsItem,
  BarChartLegendItem,
} from "@/types";

ChartJS.register(ArcElement, Tooltip, CategoryScale, LinearScale);

const getRandomColorIndex = (max: number) => {
  return Math.floor(Math.random() * max);
};

const today = dayjs();
const earliestStartDate = dayjs().subtract(30, "days");

export default function Home({
  countries,
  diseases,
  syndromes,
  subregions,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const defaultCountry = countries.filter(
    (countryData: Country) => countryData.country_name === "Australia",
  )[0];

  const [country, setCountry] = useState<Country>(defaultCountry);
  const [startDate, setStartDate] = useState<Dayjs | null>(earliestStartDate);
  const [endDate, setEndDate] = useState<Dayjs | null>(today);
  const [selectedDiseases, setSelectedDiseases] = useState<Disease[]>([]);
  const [selectedSyndromes, setSelectedSyndromes] = useState<Syndrome[]>([]);
  const [appliedSelections, setAppliedSelections] = useState<any[]>([]);
  const [countryTitleText, setCountryTitleText] = useState<string>(
    "Distribution within Australia",
  );
  const [regionTitleText, setRegionTitleText] = useState<string>(
    "Distribution within Australia and New Zealand",
  );
  const [stackedBarChartTitle, setStackedBarChartTitle] = useState<string>(
    "Reports for Australia",
  );
  const [autoTop10, setAutoTop10] = useState<boolean>(true);

  const [stackedBarChartLegend, setStackedBarChartLegend] = useState<
    Array<BarChartLegendItem>
  >([]);
  const [stackedBarChartData, setStackedBarChartData] = useState<
    BarChartDatasetsItem[]
  >([]);
  const [stackedBarChartLabels, setStackedBarChartLabels] = useState<
    Array<string>
  >([]);

  const [countryPieChartLabels, setCountryPieChartLabels] = useState<
    Array<string>
  >([]);
  const [countryPieChartData, setCountryPieChartData] = useState<
    PieChartDatasetsItem[]
  >([]);

  const [countryRegionChartLabels, setRegionPieChartLabels] = useState<
    Array<string>
  >([]);
  const [countryRegionChartData, setRegionPieChartData] = useState<
    PieChartDatasetsItem[]
  >([]);

  useEffect(() => {
    // initial load

    // No need to handle Promise returned
    updateCharts();

    // Empty dependency array, so this function only run once during init
  }, []);

  useEffect(() => {
    // initial load
    // No need to handle Promise returned
    createStackedChart();
    getRegionalPieChartData();

    // Run when countryPieChartData's value is updated
    // Because we need to get data from reportDiseasesInLocation before running any fetch requests
  }, [countryPieChartData]);

  const checkTop10Diseases = (diseaseData: DiseaseInLocations) => {
    const newSelectedDiseases = [] as Disease[];
    const diseaseArray: { name: string; count: number }[] = [];
    for (const [disease, count] of Object.entries(diseaseData)) {
      diseaseArray.push({ name: disease, count });
    }

    // if "auto top 10 diseases" is turned on, we need to get all diseases for the current country
    // and then find the top 10 from that list
    if (autoTop10) {
      diseaseArray.sort((a, b) => b.count - a.count).slice(0, 9);
    }

    diseaseArray.map((item) =>
      newSelectedDiseases.push(
        diseases.filter((d: Disease) => d.disease == item.name)[0],
      ),
    );
    setSelectedDiseases(newSelectedDiseases);

    // add the selected diseases and selected syndromes into 1 list
    const appliedSelectionWithColor = newSelectedDiseases.map(
      (item: any, idx) => {
        return { label: item.disease, color: LegendColours[idx] };
      },
    );

    setAppliedSelections(appliedSelectionWithColor);

    return appliedSelectionWithColor;
  };

  const createStackedChart = async () => {
    const rangePayload = {
      filters: {
        country_ids: country.id,
        diseases_ids: selectedDiseases,
        end_date: dayjs().format(FetchDataDateFormat),
        start_date: dayjs().subtract(30, "days").format(FetchDataDateFormat),
      },
    };

    await fetch(process.env.NEXT_PUBLIC_API_URL + "/reportDiseasesInRange", {
      ...postMethod,
      body: JSON.stringify(rangePayload),
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((response) => {
        setStackedBarChartTitle("Reports for " + country.country_name);

        // Transformed data format
        const transformedData = transformData(Object.values(response)) as any;

        // Keep consistent color for diseases / syndromes
        const colorData = transferColorProperty(
          transformedData,
          appliedSelections,
        );

        setStackedBarChartLegend(colorData);
        setStackedBarChartLabels(Object.keys(response));
        setStackedBarChartData(colorData as any);
      })
      .catch((error) => console.log(error));
  };

  const getRegionalPieChartData = async () => {
    const regionPayload = {
      filters: {
        country_ids: [country.id],
        end_date: dayjs(endDate).format(FetchDataDateFormat),
        start_date: dayjs(startDate).format(FetchDataDateFormat),
      },
    };

    await fetch(process.env.NEXT_PUBLIC_API_URL + `/reportIllnessesInRegion`, {
      ...postMethod,
      body: JSON.stringify(regionPayload),
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((response) => {
        const allIllness = Object.entries(response);

        const formattedData = allIllness.map((item) => {
          return {
            label: item[0],
            count: item[1] as number,
            backgroundColor: LegendColours[getRandomColorIndex(50)],
          };
        });

        const colorData = transferColorProperty(
          formattedData,
          appliedSelections,
        );

        setRegionPieChartLabels(formattedData.map((item: any) => item.label));

        const data = formattedData.map((item: any) => item.count);
        const backgroundColor = colorData.map(
          (item: any) => item.backgroundColor,
        );
        setRegionPieChartData([{ data, backgroundColor }]);
      })
      .catch((error) => console.log(error));
  };

  const getCountryPieChartData = async () => {
    const countryPayload = {
      filters: {
        country_ids: [country.id],
        end_date: dayjs(endDate).format(FetchDataDateFormat),
        start_date: dayjs(startDate).format(FetchDataDateFormat),
      },
    };

    await fetch(process.env.NEXT_PUBLIC_API_URL + "/reportDiseasesInLocation", {
      ...postMethod,
      body: JSON.stringify(countryPayload),
    })
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((response) => {
        let currentCountryDiseases = response;
        if (currentCountryDiseases["No results"] === 0) {
          currentCountryDiseases = { covid19: 0 };
        }

        const color = checkTop10Diseases(currentCountryDiseases);

        const formattedData = Object.entries(response).map((item) => {
          return {
            label: item[0],
            count: item[1] as number,
            backgroundColor: LegendColours[getRandomColorIndex(50)],
          };
        });

        const colorData = transferColorProperty(formattedData, color);

        setCountryPieChartLabels(formattedData.map((item: any) => item.label));

        const data = formattedData.map((item: any) => item.count);
        const backgroundColor = colorData.map(
          (item: any) => item.backgroundColor,
        );

        setCountryPieChartData([{ data, backgroundColor }]);
      })
      .catch((error) => console.log(error));
  };

  const updateCharts = async () => {
    // set subtitles on the two pie charts
    setCountryTitleText("Distribution within " + country.country_name);

    for (const [key, value] of Object.entries(subregions) as [
      string,
      string,
    ][]) {
      if (value.includes(country.iso3)) {
        setRegionTitleText("Distribution within " + key);
      }
    }

    await getCountryPieChartData();
  };

  const handleSwitchChange = () => {
    setAutoTop10(!autoTop10);
  };

  return (
    <Grid container spacing={2}>
      <Grid xs={12}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid xs={12} md={4}>
                <Autocomplete
                  id="countries"
                  size="small"
                  options={countries}
                  getOptionLabel={(option: Country) =>
                    `${option.country_name} (${option.iso3})`
                  }
                  includeInputInList
                  autoComplete
                  disableClearable
                  value={country}
                  onChange={(event: any, newValue: Country) => {
                    setCountry(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Country" />
                  )}
                />
                {!countries && <LinearProgress />}
              </Grid>

              <Grid xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    minDate={earliestStartDate}
                    maxDate={today}
                    format={DateFormat}
                    label="Start Date"
                    sx={{ width: 1 }}
                    slotProps={{ textField: { size: "small" } }}
                    value={startDate}
                    onChange={(newValue) => setStartDate(newValue)}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid xs={12} md={4}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    minDate={earliestStartDate}
                    maxDate={today}
                    format={DateFormat}
                    label="End Date"
                    sx={{ width: 1 }}
                    slotProps={{ textField: { size: "small" } }}
                    value={endDate}
                    onChange={(newValue) => setEndDate(newValue)}
                  />
                </LocalizationProvider>
              </Grid>

              <Grid xs={12} md={12}>
                <Autocomplete
                  multiple
                  size="small"
                  id="diseases"
                  options={diseases}
                  getOptionLabel={(option: Disease) => option.disease}
                  includeInputInList
                  autoComplete
                  disableCloseOnSelect
                  value={selectedDiseases}
                  onChange={(event: any, newValue: Disease[]) => {
                    setSelectedDiseases(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Disease(s)" />
                  )}
                />
                {!diseases && <LinearProgress />}
              </Grid>

              <Grid xs={12} md={12}>
                <Autocomplete
                  multiple
                  size="small"
                  id="syndromes"
                  options={syndromes}
                  getOptionLabel={(option: Syndrome) => option.syndrome}
                  includeInputInList
                  autoComplete
                  disableCloseOnSelect
                  value={selectedSyndromes}
                  onChange={(event: any, newValue: Syndrome[]) => {
                    setSelectedSyndromes(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Syndrome(s)" />
                  )}
                />
                {!syndromes && <LinearProgress />}
              </Grid>
              <Grid xs={24} md={24}>
                <div className={styles.applyButton}>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={autoTop10}
                          onChange={handleSwitchChange}
                        />
                      }
                      label="Auto Disease Top 10"
                    />
                  </FormGroup>
                  {/* TBD: add disable logic - only when filter values changes */}
                  <Button
                    variant="contained"
                    color="success"
                    onClick={updateCharts}
                  >
                    Apply
                  </Button>
                </div>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <BarChartLegend data={stackedBarChartLegend} />
      <BarChart
        labels={stackedBarChartLabels}
        datasets={stackedBarChartData}
        title={stackedBarChartTitle}
      />

      <PieChart
        labels={countryPieChartLabels}
        datasets={countryPieChartData}
        title={"Country distribution"}
        subTitle={countryTitleText}
      />
      <PieChart
        labels={countryRegionChartLabels}
        datasets={countryRegionChartData}
        title={"Regional distribution"}
        subTitle={regionTitleText}
      />
    </Grid>
  );
}

const postMethod = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  context.res.setHeader(
    "Cache-Control",
    "public, s-maxage=900, stale-while-revalidate=1000",
  );
  const countries = await (
    await fetch(process.env.NEXT_PUBLIC_API_URL + "/countries")
  ).json();
  const diseases = await (
    await fetch(process.env.NEXT_PUBLIC_API_URL + "/disease")
  ).json();
  const syndromes = await (
    await fetch(process.env.NEXT_PUBLIC_API_URL + "/syndrome")
  ).json();
  const subregions = await (
    await fetch(process.env.NEXT_PUBLIC_API_URL + "/subregions")
  ).json();

  return { props: { countries, diseases, syndromes, subregions } };
}
