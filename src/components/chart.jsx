import { Line } from "react-chartjs-2";

import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
);

const Chart = ({ iterations }) => {
  //const rSquaredValues = iterations.map((iter) => iter.regressionMetrics.rSquared);
  const min = Math.min(...iterations) - 0.01;
  const max = Math.max(...iterations) + 0.01;
  const data = {
    labels: iterations.map((_, index) => `Iteration ${index + 1}`),
    datasets: [
      {
        label: "R-Squared Progress",
        data: iterations,
        fill: false,
        backgroundColor: "#79adc0AA",
        borderColor: "#79adc0",
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "R-Squared Progression per Iteration",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: min,
        max: max,
        ticks: {
          stepSize: 0.0001,
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default Chart;
