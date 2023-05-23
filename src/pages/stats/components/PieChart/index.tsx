import { Chart as ChartJS, BarElement } from "chart.js";
import Grid from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import { Pie } from "react-chartjs-2";
import { PieChartProps } from "@/types";

ChartJS.register(BarElement);

export default function PieChart({ title, subTitle, datasets, labels }: PieChartProps) {

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },

      tooltip: {
        titleMarginBottom: 0,
        displayColors: false,
        callbacks: {
          label: (context: any) => {
            return `${context.label}` + ": " + `${context.parsed}`;
          },
          // Return an empty string, so that we can display label only  
          title: () => {
            return "";
          },
        }
      },
    }
  };

  return (
    <Grid xs={12} md={6}>
      <Card>
        {!datasets && <LinearProgress />}
        <CardContent>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color="text.secondary">
            {subTitle}
          </Typography>
          <div style={{ height: "300px" }}>
            <Pie data={{
              labels,
              datasets,
            }} options={options}
            />
          </div>
        </CardContent>
      </Card>
    </Grid>
  );
};

