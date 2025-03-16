import React, { useState } from "react";
import BarChart from "../../components/Histogram";

import styles from "../../stylesheets/Layout.module.css";
import formStyles from "../../stylesheets/Form.module.css";
import tableStyles from "../../stylesheets/Table.module.css";

const Page = () => {
  const [rawDataSet, setRawDataSet] = useState([]);
  const [iterationsData, setIterationsData] = useState({
    means: [],
    medians: [],
    stdDevs: [],
    remainingItems: [],
    discardedItems: [],
  });
  const [finalData, setFinalData] = useState([]);

  const [toggleContent, setToggleContent] = useState(false);
  const [hasDataInputUpdated, setHasDataInputUpdated] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasDataInputUpdated(false);

    const dataToProcess = Array.isArray(rawDataSet)
      ? rawDataSet.join(", ")
      : rawDataSet;

    const filteredData =
      dataToProcess.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];

    setRawDataSet(filteredData);
    calculateData(filteredData);

    setToggleContent(true);
  };

  const calculateData = (dataset) => {
    let currentDataSet = [...dataset];
    let means = [],
      medians = [],
      stdDevs = [],
      remainingItems = [],
      discardedItems = [];
    let remaining = [],
      discarded = [];

    do {
      const mean = calculateMean(currentDataSet);
      const median = calculateMedian(currentDataSet);
      const standardDeviation = calculateStandardDeviation(
        currentDataSet,
        mean
      );
      const zScores = calculateZScores(currentDataSet, mean, standardDeviation);

      [remaining, discarded] = filterDataByZScores(currentDataSet, zScores);

      means.push(mean);
      medians.push(median);
      stdDevs.push(standardDeviation);
      remainingItems.push(remaining);
      discardedItems.push(discarded);

      currentDataSet = remaining;
      setFinalData(remaining);
    } while (discarded.length > 0);

    setIterationsData({
      means,
      medians,
      stdDevs,
      remainingItems,
      discardedItems,
    });
  };

  const calculateMean = (dataset) =>
    dataset.reduce((a, b) => a + b, 0) / dataset.length;

  const calculateMedian = (dataset) => {
    const sorted = [...dataset].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  };

  const calculateStandardDeviation = (dataset, mean) => {
    const n = dataset.length;
    if (n <= 1) return 0;
    const variance =
      dataset.reduce((total, x) => total + Math.pow(x - mean, 2), 0) / (n - 1);
    return Math.sqrt(variance);
  };

  const calculateZScores = (dataset, mean, stdDev) =>
    stdDev === 0
      ? dataset.map(() => 0)
      : dataset.map((x) => ((x - mean) / stdDev).toFixed(2));

  function filterDataByZScores(dataset, zScores) {
    let remainingItemsAux = [...dataset];
    let discardedItemsAux = [];

    let maxAbsZIndex = -1;
    let maxAbsZValue = -Infinity;

    for (let i = 0; i < zScores.length; i++) {
      let absZ = Math.abs(zScores[i]);
      if ((zScores[i] < -3 || zScores[i] > 3) && absZ > maxAbsZValue) {
        maxAbsZValue = absZ;
        maxAbsZIndex = i;
      }
    }

    if (maxAbsZIndex !== -1) {
      discardedItemsAux.push(remainingItemsAux[maxAbsZIndex]);
      remainingItemsAux.splice(maxAbsZIndex, 1);
    }

    return [remainingItemsAux, discardedItemsAux];
  }

  return (
    <div className={`${styles.content}`}>
      <h2 className={`${styles.h2}`}>What is it about?</h2>
      <p>
        When a dataset is entered as input, the standard deviation will be
        iteratively calculated, the data will be zeta-scaled, and the data point
        furthest from the mean—the one with the greatest number of standard
        deviations—will be cut off. The result will be the following information
        for each iteration:
      </p>
      <ul className={`${styles.ul}`}>
        <li>Mean</li>
        <li>Median</li>
        <li>Standar Deviation</li>
        <li>Removed Item</li>
        <li>Remaining Items List</li>
        <li>Histogram</li>
      </ul>
      <hr />
      <form onSubmit={handleSubmit} className={`${formStyles.form}`}>
        <label htmlFor="rawdatasetInput" className={`${formStyles.label}`}>
          {"Raw dataset"}
          <textarea
            className={`${formStyles.textArea}`}
            name="rawdatasetInput"
            id="rawdatasetInput"
            placeholder="..."
            value={rawDataSet}
            onChange={(e) => {
              setHasDataInputUpdated(true);
              setRawDataSet(e.target.value);
            }}
          ></textarea>
        </label>
        <button
          type="submit"
          className={`${formStyles.button_first} ${formStyles.button_general} ${
            hasDataInputUpdated ? formStyles.highlighted_Button : ""
          }`.trimEnd()}
        >
          Confirm
        </button>
      </form>
      {toggleContent && (
        <>
          <hr />
          <h2>Iterated Calculations</h2>
          <div className={`${tableStyles.table_container}`}>
            <table className={`${tableStyles.table}`} id="dataTable">
              <thead>
                <tr>
                  <th>Iteration</th>
                  <th>Mean</th>
                  <th>Median</th>
                  <th>Standar Deviation</th>
                  <th>Removed Items</th>
                  <th>Remaining Items (amount)</th>
                </tr>
              </thead>
              <tbody>
                {iterationsData.means.map((_, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{iterationsData.means[index].toFixed(4)}</td>
                    <td>{iterationsData.medians[index].toFixed(4)}</td>
                    <td>{iterationsData.stdDevs[index].toFixed(4)}</td>
                    <td>{iterationsData.discardedItems[index].join(", ")}</td>
                    <td>{iterationsData.remainingItems[index].length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <hr />
          <h2>Evolution Of Data Through Iterations</h2>
          <BarChart
            key={JSON.stringify(iterationsData.remainingItems)}
            datasets={iterationsData.remainingItems}
            includeControls={true}
          />
          <hr />
          <h2>Data After Filter</h2>
          <textarea
            name="resultingDataTextArea"
            id="resultingDataTextArea"
            readOnly
            className={`${formStyles.textArea}`}
            value={`Amount: ${finalData.length} \n [${finalData}]`}
          ></textarea>
        </>
      )}
    </div>
  );
};

export default Page;
