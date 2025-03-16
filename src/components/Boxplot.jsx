import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import {
  BoxPlotController,
  BoxAndWiskers,
} from "@sgratzl/chartjs-chart-boxplot";
import { Chart } from "react-chartjs-2";

import styles from "../stylesheets/Graph.module.css";
import { ReactComponent as ChevronIcon } from "../assets/icons/chevron_icon.svg";

ChartJS.register(
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  BoxPlotController,
  BoxAndWiskers
);

const Boxplot = ({ dataset, includeControls }) => {
  const [maxDataSetIndex] = useState(dataset.means.length - 1);
  const [currentDataSetIndex, setCurrentDataSetIndex] = useState(0);

  const handleButtonClick = (step) => {
    setCurrentDataSetIndex((prevIndex) => {
      const newIndex = prevIndex + step;
      if (newIndex >= 0 && newIndex <= maxDataSetIndex) {
        return newIndex;
      }
      return prevIndex;
    });
  };

  const graphData = {
    lowerWhisker: dataset.lowerWhiskers[currentDataSetIndex],
    quartile25: dataset.quartiles25[currentDataSetIndex],
    quartile50: dataset.quartiles50[currentDataSetIndex],
    quartile75: dataset.quartiles75[currentDataSetIndex],
    upperWhisker: dataset.upperWhiskers[currentDataSetIndex],
    mean: dataset.means[currentDataSetIndex],
    outliers: dataset.discardedItems[currentDataSetIndex],
  };

  const data = {
    labels: ["Data"],
    datasets: [
      {
        label: `Iteration ${currentDataSetIndex + 1}`,
        backgroundColor: "#b587e9AA",
        borderColor: "#b587e9",
        borderWidth: 1,
        outlierRadius: 3,
        outlierBackgroundColor: "#E95D5D",
        data: [
          {
            min: graphData.lowerWhisker,
            q1: graphData.quartile25,
            median: graphData.quartile50,
            q3: graphData.quartile75,
            max: graphData.upperWhisker,
            mean: graphData.mean,
            outliers: graphData.outliers,
          },
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "y",
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        title: { display: true, text: "Values" },
        beginAtZero: true,
        suggestedMin: Math.min(
          dataset.lowerWhiskers[currentDataSetIndex],
          ...dataset.discardedItems[currentDataSetIndex]
        ),
        suggestedMax: Math.max(
          dataset.upperWhiskers[currentDataSetIndex],
          ...dataset.discardedItems[currentDataSetIndex]
        ),
      },
    },
  };

  return (
    <div className={`${styles.graph_container}`}>
      <Chart type="boxplot" data={data} options={options} />
      {includeControls && (
        <div className={`${styles.graph_button_container}`}>
          <button
            className={`${styles.icon_button} ${styles.left} ${
              currentDataSetIndex <= 0 ? styles.icon_button_disable : ""
            }`.trimEnd()}
            title="show previous graph"
            onClick={() => handleButtonClick(-1)}
            disabled={currentDataSetIndex <= 0}
          >
            <ChevronIcon className={`${styles.icon} ${styles.icon_left}`} />
          </button>
          <button
            className={`${styles.icon_button} ${styles.right} ${
              currentDataSetIndex >= maxDataSetIndex
                ? styles.icon_button_disable
                : ""
            }`.trimEnd()}
            title="show next graph"
            onClick={() => handleButtonClick(1)}
            disabled={currentDataSetIndex >= maxDataSetIndex}
          >
            <ChevronIcon className={`${styles.icon} ${styles.icon_right}`} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Boxplot;
