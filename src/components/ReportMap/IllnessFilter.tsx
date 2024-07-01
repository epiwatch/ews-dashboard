import Button from "@mui/material/Button";
import styles from "@/styles/Map.module.css";
import { Dispatch, SetStateAction, SyntheticEvent, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Autocomplete from "@mui/material/Autocomplete";
import { ClickAwayListener, Grid, TextField } from "@mui/material";
import { FilterAltOutlined } from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/system/Box";
import Chip from "@mui/material/Chip";
import { Disease, Syndrome } from "@/types";
import { useTranslation } from "react-i18next";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { checkLang } from "@/components/utils/dataUtils";
import { Dayjs } from "dayjs";

type IllnessFilterProps = {
  mapDiseases: Disease[];
  mapSyndromes: Syndrome[];
  selectedDiseases: Disease[];
  setSelectedDiseases: Dispatch<SetStateAction<Disease[]>>;
  selectedSyndromes: Syndrome[];
  setSelectedSyndromes: Dispatch<SetStateAction<Syndrome[]>>;
  applyDiseaseSyndromeFilter: () => void;
  allDiseases: Disease | null;
  dateRangeStart: Dayjs | null;
  dateRangeEnd: Dayjs | null;
  setDateRangeStart: Dispatch<SetStateAction<Dayjs | null>>;
  setDateRangeEnd: Dispatch<SetStateAction<Dayjs | null>>;
};

export default function IllnessFilter({
  mapDiseases,
  mapSyndromes,
  selectedDiseases,
  setSelectedDiseases,
  selectedSyndromes,
  setSelectedSyndromes,
  applyDiseaseSyndromeFilter,
  allDiseases,
  dateRangeStart,
  dateRangeEnd,
  setDateRangeStart,
  setDateRangeEnd
}: IllnessFilterProps) {
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    checkLang(i18n);
  }, []);

  const handleFilterChange = (change: boolean) => {
    setShowFilters(change);
  };

  const checkItemDisabled = (item: Disease) => {
    return (
      selectedDiseases.length > 0 &&
      allDiseases !== null &&
      selectedDiseases[0].name == allDiseases.name &&
      item.name !== allDiseases.name
    );
  };

  const setAndCheckDiseases = (_: SyntheticEvent, v: Disease[]) => {
    if (allDiseases !== null && v.includes(allDiseases) == true) {
      setSelectedDiseases([allDiseases]);
    } else {
      setSelectedDiseases([...v]);
    }
  };

  const setAllDiseases = () => {
    if (allDiseases !== null) {
      setSelectedDiseases([allDiseases]);
    }
  };

  const clearAllDisease = () => {
    setSelectedDiseases([]);
    setSelectedSyndromes([]);
  };

  return (
    <ClickAwayListener onClickAway={() => handleFilterChange(false)}>
      <Box>
        <IconButton
          className={styles.diseaseFilterButton}
          size="small"
          onClick={() => handleFilterChange(!showFilters)}>
          <FilterAltOutlined />
        </IconButton>

        {showFilters && (
          <Card className={styles.diseaseFilter}>
            <CardContent className={styles.searchContainer}>
              <Grid container spacing={2} sx={{ padding: "10px 0px" }}>
                <Grid item xs={6}>
                  <DatePicker
                    label={t("map.start_date_tag")}
                    value={dateRangeStart}
                    onChange={(newValue) => setDateRangeStart(newValue)}
                    slotProps={{ textField: { size: "small" } }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <DatePicker
                    label={t("map.end_date_tag")}
                    value={dateRangeEnd}
                    slotProps={{ textField: { size: "small" } }}
                    onChange={(newValue) => setDateRangeEnd(newValue)}
                  />
                </Grid>
              </Grid>
              <Autocomplete
                multiple
                size="small"
                id="tags-outlined"
                options={mapDiseases}
                onChange={setAndCheckDiseases}
                value={selectedDiseases}
                sx={{ marginBottom: "10px" }}
                getOptionDisabled={checkItemDisabled}
                disableCloseOnSelect
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("map.diseases_tag")}
                    variant="standard"
                  />
                )}
                getOptionLabel={(option) =>
                  option !== null && option.name !== undefined
                    ? option.name
                    : option.disease
                }
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={
                        option !== null && option.name !== undefined
                          ? option.name
                          : option.disease
                      }
                      size="small"
                      {...getTagProps({ index })}
                      sx={
                        option !== null && allDiseases !== null && option.name == allDiseases.name
                          ? { backgroundColor: "#fdb950" }
                          : null
                      }
                      key={index}
                    />
                  ))
                }
              />
              <Autocomplete
                multiple
                size="small"
                id="tags-outlined"
                options={mapSyndromes}
                onChange={(_, v) => {
                  setSelectedSyndromes([...v]);
                }}
                value={selectedSyndromes}
                getOptionLabel={(option) =>
                  option !== null && option.name !== undefined
                    ? option.name
                    : option.syndrome
                }
                disableCloseOnSelect
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t("map.syndromes_tag")}
                    variant="standard"
                  />
                )}
              />
            </CardContent>
            <CardActions className={styles.buttonContainer}>
              <Button
                variant="contained"
                size="small"
                className={styles.allDiseasesButton}
                onClick={setAllDiseases}
              >
                {t("map.all_diseases_upper")}
              </Button>
              <Button
                variant="contained"
                size="small"
                className={styles.fitlerApplyButton}
                onClick={() => applyDiseaseSyndromeFilter()}
              >
                {t("map.apply_tag")}
              </Button>
              <Button
                variant="contained"
                size="small"
                className={styles.clearButton}
                onClick={clearAllDisease}
              >
                {t("map.clear")}
              </Button>
            </CardActions>
          </Card>
        )}
      </Box>
    </ClickAwayListener>
  );
}
