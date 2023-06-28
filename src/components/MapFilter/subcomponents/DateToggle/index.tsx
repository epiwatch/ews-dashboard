import Button from "@mui/material/Button";
import styles from "@/styles/Map.module.css";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";

const today = dayjs();
const earliestStartDate = dayjs().subtract(30, "days");

export default function DateToggle() {
  // TBD: should control by father component
  const [selectedDateButton, setSelectedDateButton] = useState("7Days");
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const handleDateChange = (
    event: React.MouseEvent<HTMLElement>,
    selectedButton: string,
  ) => {
    setSelectedDateButton(selectedButton);
  };

  const showDatePicker = selectedDateButton === "range";

  const customDatepickerStyle = {
    svg: { color: "white" },
    input: { color: "white" },
    label: { color: "white" },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "white",
    },
  };

  return (
    <>
      <ToggleButtonGroup
        size="small"
        value={selectedDateButton}
        exclusive
        onChange={handleDateChange}
        aria-label="Platform"
        sx={{
          "& .MuiToggleButton-root": {
            color: "#9F9E9F",
            backgroundColor: "#282729",

            "&.Mui-selected": {
              color: "white",
              backgroundColor: "#4F4D4F",
            },
          },
        }}
      >
        <ToggleButton value="7Days">Last 7 Days</ToggleButton>
        <ToggleButton value="30Days">Last 30 Days</ToggleButton>
        <ToggleButton value="range">Range</ToggleButton>
      </ToggleButtonGroup>

      {showDatePicker && (
        <div className={styles.datepickerContainer}>
          <DatePicker
            sx={customDatepickerStyle}
            minDate={earliestStartDate}
            maxDate={today}
            label="From date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
          />

          <DatePicker
            sx={customDatepickerStyle}
            minDate={earliestStartDate}
            maxDate={today}
            label="Till date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
          />

          <Button variant="contained" className={styles.applyButton}>
            Apply
          </Button>
        </div>
      )}
    </>
  );
}
