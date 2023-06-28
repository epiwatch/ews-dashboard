import styles from "@/styles/Map.module.css";
import { useState } from "react";

import MapSetting from "./subcomponents/MapSetting";
import DateToggle from "./subcomponents/DateToggle";
import DiseasesFilter from "./subcomponents/DiseasesFilter";
import Legend from "./subcomponents/Legend";

export default function MapFilter() {
  const [selectedDateButton, setSelectedDateButton] = useState("7Days");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [showMapSetting, setShowMapSetting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expanded, setExpanded] = useState<string | false>("mapPanel");

  const handleDateChange = (
    event: React.MouseEvent<HTMLElement>,
    selectedButton: string,
  ) => {
    setSelectedDateButton(selectedButton);
  };

  const handleSettingChange = () => {
    setShowMapSetting(!showMapSetting);
  };

  const handleFilterChange = () => {
    setShowFilters(!showFilters);
  };

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  return (
    <div className={styles.filterContainer}>
      <MapSetting />
      <DateToggle />
      <DiseasesFilter />
      {/*<Legend />*/}
    </div>
  );
}
