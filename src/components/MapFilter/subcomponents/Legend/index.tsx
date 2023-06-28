import styles from "@/styles/Map.module.css";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from "@mui/material";
import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function Legend() {
  const [expandLegend, setExpandLegend] = useState(true);

  const handleAccordionChange = () => {
    setExpandLegend(!expandLegend);
  };

  const legendData = [
    {
      color: "red",
      name: "flu",
    },
    {
      color: "blue",
      name: "covid19999999999999",
    },
    {
      color: "black",
      name: "headache",
    },
    {
      color: "yellow",
      name: "amoeba",
    },
    {
      color: "red",
      name: "flu",
    },
    {
      color: "blue",
      name: "covid19999999999999",
    },
    {
      color: "black",
      name: "headache",
    },
    {
      color: "yellow",
      name: "amoeba",
    },
    {
      color: "red",
      name: "flu",
    },
    {
      color: "blue",
      name: "covid19999999999999",
    },
    {
      color: "black",
      name: "headache",
    },
    {
      color: "yellow",
      name: "amoeba",
    },
  ];

  return (
    <Accordion
      className={styles.legendContainer}
      expanded={expandLegend}
      onChange={handleAccordionChange}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="legend-header"
      >
        <Typography>Legend</Typography>
      </AccordionSummary>
      <AccordionDetails className={styles.legendContent}>
        {legendData.length === 0 ? (
          <div>No diseases/syndromes were selected.</div>
        ) : (
          legendData.map((data, idx) => (
            <div key={idx} className={styles.legendItem}>
              <div
                style={{ backgroundColor: data.color }}
                className={styles.legendSquare}
              />
              <span>{data.name}</span>
            </div>
          ))
        )}
      </AccordionDetails>
    </Accordion>
  );
}
