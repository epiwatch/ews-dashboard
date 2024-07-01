/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
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
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import LinearProgress from "@mui/material/LinearProgress";
import dayjs, { Dayjs } from "dayjs";
import styles from "@/styles/Stats.module.css";
import { DateFormat, DefaultCountryId, DefaultDiseaseId, FetchDataDateFormat } from "@/components/utils/constant";
import BarChart from "../../components/Stats/BarChart";
import PieChart from "../../components/Stats/PieChart";
import BarChartLegend from "../../components/Stats/BarChartLegend";
import {
  transformData,
  transferColorProperty,
  checkLang,
} from "@/components/utils/dataUtils";
import {
  Country,
  Disease,
  Syndrome,
  PieChartDatasetsItem,
  BarChartDatasetsItem,
  BarChartLegendItem,
  SelectionType,
  Top10DiseasesType,
  CheckArrayType,
} from "@/types";
import { useTranslation } from "react-i18next";

ChartJS.register(ArcElement, Tooltip, CategoryScale, LinearScale);

const today = dayjs();
const earliestStartDate = dayjs().subtract(30, "days");

export default function Home() {
  const [countries, setCountries] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [syndromes, setSyndromes] = useState([]);
  const [country, setCountry] = useState<Country | undefined>(undefined);
  const [startDate, setStartDate] = useState<Dayjs>(earliestStartDate);
  const [endDate, setEndDate] = useState<Dayjs>(today);
  const [selectedDiseases, setSelectedDiseases] = useState<Disease[]>([]);
  const [selectedSyndromes, setSelectedSyndromes] = useState<Syndrome[]>([]);
  const [appliedSelections, setAppliedSelections] = useState<SelectionType[]>(
    [],
  );
  const [disableApply, setDisableApply] = useState<boolean>(true);
  const [autoTop10, setAutoTop10] = useState<boolean>(false);
  const [initialLoad, setInitialLoad] = useState<boolean>(true);
  const [countryTitleText, setCountryTitleText] = useState<string>("");
  const [regionTitleText, setRegionTitleText] = useState<string>("");
  const [stackedBarChartTitle, setStackedBarChartTitle] = useState<string>("");
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
  const { t, i18n } = useTranslation();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!initialLoad && autoTop10) {
      setDisableApply(true);
      getTop10Diseases();
    }
  }, [country, startDate, endDate]);

  useEffect(() => {
    const validDiseases = Array.isArray(diseases) && diseases.length > 0;
    const validSyndromes = Array.isArray(syndromes) && syndromes.length > 0;
    const validCountry =
      typeof country === "object" &&
      country !== null &&
      Object.entries(country).length > 0;

    if (validDiseases && validSyndromes && validCountry) {
      setAutoTop10(true);
    }
  }, [countries, country, diseases, syndromes]);

  useEffect(() => {
    getCountryPieChartData();
    createStackedChart();
    getRegionalPieChartData();
  }, [appliedSelections]);

  const loadData = async () => {
    try {
      checkLang(i18n);
      const getCountries = () =>
        Promise.resolve(
          fetch(
            process.env.NEXT_PUBLIC_API_URL + `/countries?lang=${i18n.language}`)
            .then((res) => {
              if (res !== null && res.status === 200) {
                return res.json();
              } else {
                return null;
              }
            })
            .then((obj) => {
              if (obj !== null && obj.length > 0) {
                setCountries(obj);
                const defaultCountry = obj.filter(
                  (countryData: Country) =>
                    countryData.id == DefaultCountryId
                );
                if (defaultCountry !== null && defaultCountry.length > 0) {
                  setCountry(defaultCountry[0]);
                }
              }
            }),
        );
      const getDiseases = () =>
        Promise.resolve(
          fetch(process.env.NEXT_PUBLIC_API_URL + `/disease?lang=${i18n.language}`)
            .then((res) => {
              if (res !== null && res.status === 200) {
                return res.json();
              } else {
                return null;
              }
            })
            .then((obj) => {
              if (obj !== null && obj.length > 0) {
                const tempDiseases = obj.filter((el: Disease) => el.disease !== null);
                setDiseases(tempDiseases);
              }
            }),
        );
      const getSyndromes = () =>
        Promise.resolve(
          fetch(process.env.NEXT_PUBLIC_API_URL + `/syndrome?lang=${i18n.language}`)
            .then((res) => {
              if (res !== null && res.status === 200) {
                return res.json();
              } else {
                return null;
              }
            })
            .then((obj) => {
              if (obj !== null && obj.length > 0) {
                setSyndromes(obj);
              }
            }),
        );

      Promise.allSettled([
        getCountries(),
        getDiseases(),
        getSyndromes()
      ]);
    } catch (e: unknown) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (autoTop10) {
      setDisableApply(true);
      getTop10Diseases();
    }
  }, [autoTop10]);

  useEffect(() => {
    if (autoTop10 && selectedDiseases.length > 0 && disableApply) {
      setDisableApply(false);
      if (initialLoad) {
        updateCharts();
        setInitialLoad(false);
      }
    }
  }, [selectedDiseases]);

  const getUrlParams = (includeIllnesses: boolean) => {
    let urlParams = "";
    if (
      typeof country === "object" &&
      country !== null &&
      Object.entries(country).length > 0
    ) {
      const dateStr = (date: Dayjs) => dayjs(date).format(FetchDataDateFormat);
      const selectedDiseasesIds = selectedDiseases.map((el) => el.id);
      const selectedSyndromesIds = selectedSyndromes.map((el) => el.id);

      const illnessStr = (
        illnessIdStr: string,
        selectedIllnesses: (string | undefined)[],
      ) => `&${illnessIdStr}=` + selectedIllnesses.join(`&${illnessIdStr}=`);
      urlParams = `&country_id=${country.id}&start_date=${dateStr(
        startDate,
      )}&end_date=${dateStr(endDate)}`;
      if (
        includeIllnesses &&
        selectedDiseases.length > 0 &&
        selectedDiseases.length > 0
      ) {
        urlParams += illnessStr("disease_ids", selectedDiseasesIds);
      }
      if (
        includeIllnesses &&
        selectedDiseases.length > 0 &&
        selectedSyndromes.length > 0
      ) {
        urlParams += illnessStr("syndrome_ids", selectedSyndromesIds);
      }
    }
    return urlParams;
  };

  const getTop10Diseases = async () => {
    fetch(process.env.NEXT_PUBLIC_API_URL +
      `/countryTop10Diseases?lang=${i18n.language}${getUrlParams(false)}`)
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((newTop10Diseases) => {
        const newSelectedDiseases = [] as Disease[];
        if (newTop10Diseases.length == 0) {
          newTop10Diseases = [{ id: DefaultDiseaseId }];
        }

        newTop10Diseases.forEach((item: Top10DiseasesType) =>
          newSelectedDiseases.push(
            diseases.filter((d: Disease) => d.id == String(item.id))[0],
          ),
        );
        setSelectedDiseases(newSelectedDiseases);
      })
      .catch((error) => console.log(error));
  };

  const createStackedChart = async () => {
    await fetch(
      process.env.NEXT_PUBLIC_API_URL +
      `/reportIllnessesInRange?lang=${i18n.language}${getUrlParams(true)}`
    )
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((response) => {
        if (
          response !== null &&
          typeof country === "object" &&
          country !== null &&
          Object.entries(country).length > 0
        ) {
          setStackedBarChartTitle(t("stats.reports_for_tag", { val: country.country_name }));

          // Transformed data format
          const transformedData = transformData(
            Object.values(response),
          ) as never;

          // Keep consistent color for diseases / syndromes
          const colorData = transferColorProperty(
            transformedData,
            appliedSelections,
          );

          setStackedBarChartLegend(colorData);
          setStackedBarChartLabels(Object.keys(response));
          setStackedBarChartData(colorData as never);
        }
      })
      .catch((error) => console.log(error));
  };

  const getRegionalPieChartData = async () => {
    fetch(process.env.NEXT_PUBLIC_API_URL +
      `/reportIllnessesInRegion?lang=${i18n.language}${getUrlParams(true)}`)
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
            backgroundColor: "",
          };
        });

        const colorData = transferColorProperty(
          formattedData,
          appliedSelections,
        );

        setRegionPieChartLabels(
          formattedData.map((item: CheckArrayType) => item.label),
        );

        const data = formattedData.map((item: CheckArrayType) => item.count);
        const backgroundColor = colorData.map(
          (item: CheckArrayType) => item.backgroundColor,
        );
        setRegionPieChartData([{ data, backgroundColor }]);
      })
      .catch((error) => console.log(error));
  };

  const getCountryPieChartData = async () => {
    fetch(process.env.NEXT_PUBLIC_API_URL +
      `/reportIllnessInCountry?lang=${i18n.language}${getUrlParams(true)}`)
      .then((res) => {
        if (res.status === 200) {
          return res.json();
        }
      })
      .then((response) => {
        const formattedData = Object.entries(response).map((item) => {
          return {
            label: item[0],
            count: item[1] as number,
            backgroundColor: "",
          };
        });

        const colorData = transferColorProperty(
          formattedData,
          appliedSelections,
        );

        setCountryPieChartLabels(
          formattedData.map((item: CheckArrayType) => item.label),
        );

        const data = formattedData.map((item: CheckArrayType) => item.count);
        const backgroundColor = colorData.map(
          (item: CheckArrayType) => item.backgroundColor,
        );

        setCountryPieChartData([{ data, backgroundColor }]);
      })
      .catch((error) => console.log(error));
  };

  const updateCharts = () => {
    // set subtitles on the two pie charts
    if (
      typeof country === "object" &&
      country !== null &&
      Object.entries(country).length > 0
    ) {
      setCountryTitleText(t("stats.distribution_within_tag", { val: country.country_name }));
      setRegionTitleText(t("stats.distribution_within_tag", { val: country.subregion }));
    }

    const appliedSelectionsWithColour: SelectionType[] = [];
    selectedDiseases.forEach((item: Disease) => {
      appliedSelectionsWithColour.push({
        label: item.disease,
        color: item.colour,
      });
    });
    selectedSyndromes.forEach((item: Syndrome) => {
      appliedSelectionsWithColour.push({
        label: item.syndrome,
        color: item.colour,
      });
    });

    setAppliedSelections(appliedSelectionsWithColour);
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
                  isOptionEqualToValue={(option: Country, value: Country) =>
                    option.iso3 === value.iso3
                  }
                  onChange={(event, newValue: Country) => {
                    setCountry(newValue);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label={t("stats.country_tag")} />
                  )}
                />
                {!(countries.length > 0) && <LinearProgress />}
              </Grid>

              <Grid xs={12} md={4}>
                <DatePicker
                  format={DateFormat}
                  label={t("stats.start_date_tag")}
                  sx={{ width: 1 }}
                  slotProps={{ textField: { size: "small" } }}
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue as Dayjs)}
                />
              </Grid>

              <Grid xs={12} md={4}>
                <DatePicker
                  format={DateFormat}
                  label={t("stats.end_date_tag")}
                  sx={{ width: 1 }}
                  slotProps={{ textField: { size: "small" } }}
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue as Dayjs)}
                />
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
                  isOptionEqualToValue={(option: Disease, value: Disease) =>
                    option.id === value.id
                  }
                  // onChange={(event, newValue: Disease[]) => {
                  //   setSelectedDiseases(newValue);
                  // }}

                  onChange={(event, newValue: readonly Disease[]) => {
                    const mutableDiseases = [...newValue];
                    setSelectedDiseases(mutableDiseases);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label={t("stats.diseases_tag")} />
                  )}
                />
                {!(diseases.length > 0) && <LinearProgress />}
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
                  isOptionEqualToValue={(option: Syndrome, value: Syndrome) =>
                    option.id === value.id
                  }
                  onChange={(event, newValue: readonly Syndrome[]) => {
                    const mutableSyndromes = [...newValue];
                    setSelectedSyndromes(mutableSyndromes);
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label={t("stats.syndromes_tag")} />
                  )}
                />
                {!(syndromes.length > 0) && <LinearProgress />}
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
                      label={t("stats.disease_top_10_tag")}
                    />
                  </FormGroup>
                  <Button
                    variant="contained"
                    color="success"
                    disabled={disableApply}
                    onClick={updateCharts}
                  >
                    {t("stats.apply_tag")}
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
        title={t("stats.country_distribution_tag")}
        subTitle={countryTitleText}
      />
      <PieChart
        labels={countryRegionChartLabels}
        datasets={countryRegionChartData}
        title={t("stats.regional_distribution_tag")}
        subTitle={regionTitleText}
      />
    </Grid>
  );
}
