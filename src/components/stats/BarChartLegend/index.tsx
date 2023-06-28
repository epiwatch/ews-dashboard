import { Chart as ChartJS, Legend } from "chart.js";
import Grid from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import styles from "@/styles/Stats.module.css";
import { BarChartLegendProps } from "@/types";

ChartJS.register(Legend);

export default function BarChartLegend({ data }: BarChartLegendProps) {
  return (
    <Grid xs={12} md={2}>
      <Card className={styles.legendContainer}>
        {data.length < 0 && <LinearProgress />}
        <CardContent>
          <Typography
            variant="h6"
            component="div"
            className={styles.legendTitle}
          >
            Legend
          </Typography>
          {data.map((item, idx) => (
            <div className={styles.legendItemContainer} key={idx}>
              <div
                className={styles.legendSquare}
                style={{ backgroundColor: item.backgroundColor }}
              />
              <span className={styles.legendItem}>{item.label}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </Grid>
  );
}
