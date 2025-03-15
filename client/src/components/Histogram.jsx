import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

import styles from "../stylesheets/Graph.module.css";
import { ReactComponent as ChevronIcon } from "../assets/icons/chevron_icon.svg";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const BarChart = ({ datasets, groupsAmount = 10, includeControls }) => {
  const [maxDataSetIndex] = useState(datasets.length - 1);
  const [dataSetIndex, setDataSetIndex] = useState(0);
  const [currentDataset, setCurrentDataset] = useState(datasets[0]);

  const handleButtonClick = (step) => {
    setDataSetIndex((prevIndex) => {
      const newIndex = prevIndex + step;
      if (newIndex >= 0 && newIndex <= maxDataSetIndex) {
        setCurrentDataset(datasets[newIndex]);
        return newIndex;
      }
      return prevIndex;
    });
  };

  const calculateGroups = (dataset, groupAmount) => {
    if (dataset.length === 0) return { labels: [], bins: [] };
    const min = Math.min(...dataset);
    const max = Math.max(...dataset);
    const interval = (max - min) / groupAmount;

    let bins = new Array(groupAmount).fill(0);
    let labels = [];

    for (let i = 0; i < groupAmount; i++) {
      let lowerBound = min + i * interval;
      let upperBound = lowerBound + interval;
      if (i === groupAmount - 1) upperBound = max;

      labels.push(`[${lowerBound.toFixed(2)} - ${upperBound.toFixed(2)}]`);
    }

    dataset.forEach((value) => {
      let index = Math.min(
        Math.floor((value - min) / interval),
        groupAmount - 1
      );
      bins[index]++;
    });

    return { labels, bins };
  };

  let { labels, bins } = calculateGroups(currentDataset, groupsAmount);

  const data = {
    labels: labels,
    datasets: [
      {
        label: `Iteration ${dataSetIndex + 1}`,
        data: bins,
        backgroundColor: "#95c267AA",
        borderColor: "#95c267",
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { enabled: true },
    },
    scales: {
      x: {
        title: { display: true, text: "Values Ranges" },
      },
      y: {
        title: { display: true, text: "Density" },
      },
    },
    datasets: {
      bar: {
        barThickness: "flex",
        categoryPercentage: 1.0,
        barPercentage: 1.0,
      },
    },
  };

  return (
    <div className={`${styles.graph_container}`}>
      <Bar data={data} options={options} />
      {includeControls && (
        <div className={`${styles.graph_button_container}`}>
          <button
            className={`${styles.icon_button} ${styles.left} ${
              dataSetIndex <= 0 ? styles.icon_button_disable : ""
            }`.trimEnd()}
            title="show previous graph"
            onClick={() => handleButtonClick(-1)}
            disabled={dataSetIndex <= 0}
          >
            <ChevronIcon className={`${styles.icon} ${styles.icon_left}`} />
          </button>
          <button
            className={`${styles.icon_button} ${styles.right} ${
              dataSetIndex >= maxDataSetIndex ? styles.icon_button_disable : ""
            }`.trimEnd()}
            title="show next graph"
            onClick={() => handleButtonClick(1)}
            disabled={dataSetIndex >= maxDataSetIndex}
          >
            <ChevronIcon className={`${styles.icon} ${styles.icon_right}`} />
          </button>
        </div>
      )}
    </div>
  );
};

export default BarChart;
