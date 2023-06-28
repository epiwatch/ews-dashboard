import Button from "@mui/material/Button";
import styles from "@/styles/Map.module.css";

import { useState } from "react";

import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Autocomplete from "@mui/material/Autocomplete";
import { IconButton, TextField } from "@mui/material";
import { InfoOutlined, Search } from "@mui/icons-material";

import Tooltip, { TooltipProps, tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

const top100Films = [
  { title: "The Shawshank Redemption", year: 1994 },
  { title: "The Godfather", year: 1972 },
  { title: "The Godfather: Part II", year: 1974 },
  { title: "The Dark Knight", year: 2008 },
  { title: "12 Angry Men", year: 1957 },
  { title: "Schindler's List", year: 1993 },
  { title: "Pulp Fiction", year: 1994 },
];

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: "none",
  },
});

const SearchMessage = (
  <div className={styles.searchMessage}>
    <b className={styles.searchMessageTitle}>Search conditionals</b>
    <ul className={styles.searchMessageContent}>
      <li>
        <b>AND</b> - report titles need to include both of these terms.{" "}
      </li>
      <li>
        <b>OR</b> - report titles need to include either of these terms.{" "}
      </li>
      <li>
        <b>NOT()</b> - report titles need to not include these terms. The not
        condition uses parentheses.{" "}
      </li>
      <li>
        <b>Grouping with parentheses()</b> - used for grouping conditions for
        more complicated searches.{" "}
      </li>
    </ul>
    <div className={styles.searchMessageContent}>
      <b>Example search</b>
      {': "tomato AND (virus OR flu) AND NOT (children)"'}
    </div>
  </div>
);

export default function DiseasesFilter() {
  // TBD: should control by father component
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = () => {
    setShowFilters(!showFilters);
  };

  return (
    <>
      <Button
        variant="contained"
        className={styles.diseaseFilterButton}
        onClick={handleFilterChange}
      >
        FILTER BY DISEASE/SYNDROME
      </Button>

      {showFilters && (
        <Card className={styles.diseaseFilter}>
          <CardContent className={styles.searchContainer}>
            <div>
              <TextField
                placeholder="Keyword search"
                id="standard-start-adornment"
                sx={{ minWidth: "375px" }}
                variant="standard"
                InputProps={{
                  endAdornment: <Search />,
                }}
              />
              <CustomWidthTooltip title={SearchMessage} placement="left">
                <IconButton>
                  <InfoOutlined />
                </IconButton>
              </CustomWidthTooltip>
            </div>
            <Autocomplete
              multiple
              id="tags-outlined"
              options={top100Films}
              getOptionLabel={(option) => option.title}
              defaultValue={[top100Films[1]]}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField {...params} label="Disease(s)" variant="standard" />
              )}
            />
            <Autocomplete
              multiple
              id="tags-outlined"
              options={top100Films}
              getOptionLabel={(option) => option.title}
              defaultValue={[top100Films[1]]}
              filterSelectedOptions
              renderInput={(params) => (
                <TextField {...params} label="Syndrome(s)" variant="standard" />
              )}
            />
          </CardContent>
          <CardActions className={styles.buttonContainer}>
            <Button
              variant="contained"
              size="small"
              className={styles.allDiseasesButton}
            >
              ALL DISEASES
            </Button>
            <Button
              variant="contained"
              size="small"
              className={styles.fitlerApplyButton}
            >
              APPLY
            </Button>
            <Button
              variant="contained"
              size="small"
              className={styles.clearButton}
            >
              CLEAR
            </Button>
          </CardActions>
        </Card>
      )}
    </>
  );
}
