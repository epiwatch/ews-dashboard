import Button from "@mui/material/Button";
import SettingsIcon from "@mui/icons-material/Settings";
import styles from "@/styles/Map.module.css";
import { useState } from "react";

import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

export default function MapSetting() {
  // TBD: should control by father component
  const [showMapSetting, setShowMapSetting] = useState(false);
  const [expanded, setExpanded] = useState<string | false>("mapPanel");

  const handleSettingChange = () => {
    setShowMapSetting(!showMapSetting);
  };

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  return (
    <>
      <Button
        onClick={handleSettingChange}
        variant="contained"
        className={styles.settingButton}
      >
        <SettingsIcon />
      </Button>
      {showMapSetting && (
        <div className={styles.settingAccordionContainer}>
          <Accordion
            className={styles.settingAccordion}
            disableGutters
            expanded={expanded === "mapPanel"}
            onChange={handleAccordionChange("mapPanel")}
            sx={{
              "& .MuiAccordion-root": {
                "& .Mui-expanded": {
                  margin: "0px",
                },
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Map Background</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue="imagery"
                  name="map-background-radio-buttons-group"
                >
                  <FormControlLabel
                    value="street"
                    control={<Radio />}
                    label="Street Map"
                  />
                  <FormControlLabel
                    value="topo"
                    control={<Radio />}
                    label="Topo Map"
                  />
                  <FormControlLabel
                    value="imagery"
                    control={<Radio />}
                    label="Imagery Map"
                  />
                  <FormControlLabel
                    value="light"
                    control={<Radio />}
                    label="Light"
                  />
                  <FormControlLabel
                    value="dark"
                    control={<Radio />}
                    label="Dark"
                  />
                </RadioGroup>
              </FormControl>
            </AccordionDetails>
          </Accordion>
          <Accordion
            className={styles.settingAccordion}
            disableGutters
            expanded={expanded === "coloursPanel"}
            onChange={handleAccordionChange("coloursPanel")}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
            >
              <Typography>Chart Colours</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <FormControl>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  defaultValue="bright"
                  name="map-chart-colours-radio-buttons-group"
                >
                  <FormControlLabel
                    value="bright"
                    control={<Radio />}
                    label="Bright"
                  />
                  <FormControlLabel
                    value="light"
                    control={<Radio />}
                    label="Light"
                  />
                  <FormControlLabel
                    value="dark"
                    control={<Radio />}
                    label="Dark"
                  />
                </RadioGroup>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        </div>
      )}
    </>
  );
}
