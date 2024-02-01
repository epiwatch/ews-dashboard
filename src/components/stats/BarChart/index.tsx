import { Chart as ChartJS, BarElement } from "chart.js";
import Grid from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import { Bar } from "react-chartjs-2";
import { BarChartProps } from "@/types";

ChartJS.register(BarElement);

export default function BarChart({ title, datasets, labels }: BarChartProps) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        grace: "5%",
      },
    },
  };

  return (
    <Grid xs={12} md={10}>
      <Card>
        {datasets.length === 0 && <LinearProgress />}
        <CardContent>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <div style={{ height: "300px" }}>
            <Bar
              data={{
                labels,
                datasets,
              }}
              options={options}
            />
          </div>
        </CardContent>
      </Card>
    </Grid>
  );
}
