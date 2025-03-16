import React, { useState } from "react";
import Boxplot from "../../components/Boxplot";

import styles from "../../stylesheets/Layout.module.css";
import formStyles from "../../stylesheets/Form.module.css";
import tableStyles from "../../stylesheets/Table.module.css";

const Page = () => {
  const [rawDataSet, setRawDataSet] = useState([]);
  const [iterationsData, setIterationsData] = useState({
    lowerWhiskers: [],
    quartiles25: [],
    quartiles50: [],
    quartiles75: [],
    upperWhiskers: [],
    means: [],
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

    let lowerWhiskers = [],
      quartiles25 = [],
      quartiles50 = [],
      quartiles75 = [],
      upperWhiskers = [],
      means = [],
      remainingItems = [],
      discardedItems = [];

    let remaining = [];
    let discarded = [];

    do {
      const mean = calculateMean(currentDataSet);
      const quartile25 = calculateQuartile(currentDataSet, 1);
      const quartile50 = calculateQuartile(currentDataSet, 2);
      const quartile75 = calculateQuartile(currentDataSet, 3);
      const [maxW, minW] = calculateWhiskers(
        currentDataSet,
        quartile25,
        quartile75
      );

      [remaining, discarded] = findOutliers(currentDataSet, maxW, minW);

      lowerWhiskers.push(minW);
      quartiles25.push(quartile25);
      quartiles50.push(quartile50);
      quartiles75.push(quartile75);
      upperWhiskers.push(maxW);
      means.push(mean);
      remainingItems.push(remaining);
      discardedItems.push(discarded);

      currentDataSet = remaining;
      setFinalData(remaining);
    } while (discarded.length > 0);

    setIterationsData({
      lowerWhiskers,
      quartiles25,
      quartiles50,
      quartiles75,
      upperWhiskers,
      means,
      remainingItems,
      discardedItems,
    });
  };

  const calculateMean = (dataset) =>
    dataset.reduce((a, b) => a + b, 0) / dataset.length;

  const calculateQuartile = (dataset, quartile) => {
    if (![1, 2, 3].includes(quartile) || dataset.length === 0) return NaN;

    const sortedData = [...dataset].sort((a, b) => a - b);

    const position = (quartile / 4) * (sortedData.length + 1);
    const index = Math.floor(position) - 1;
    const fraction = position - Math.floor(position);

    if (index >= 0 && index < sortedData.length - 1) {
      return (
        sortedData[index] +
        fraction * (sortedData[index + 1] - sortedData[index])
      );
    }

    return sortedData[Math.max(0, Math.min(index, sortedData.length - 1))];
  };

  const calculateWhiskers = (dataset, quartile25, quartile75) => {
    if (dataset.length === 0) return [NaN, NaN];

    const iqr = quartile75 - quartile25;

    let maxWhisker = quartile75 + iqr * 1.5;
    let minWhisker = quartile25 - iqr * 1.5;

    const maxValue = Math.max(...dataset);
    const minValue = Math.min(...dataset);

    return [Math.min(maxValue, maxWhisker), Math.max(minValue, minWhisker)];
  };

  const findOutliers = (dataset, upperWhisker, lowerWhisker) => {
    let remainingItemsAux = [...dataset];
    let discardedItemsAux = [];

    let outliers = dataset.filter(
      (value) => value < lowerWhisker || value > upperWhisker
    );
    if (outliers.length > 0) {
      let farthestOutlier = outliers.reduce((max, value) => {
        let distance =
          value < lowerWhisker
            ? Math.abs(value - lowerWhisker)
            : Math.abs(value - upperWhisker);

        let maxDistance =
          max < lowerWhisker
            ? Math.abs(max - lowerWhisker)
            : Math.abs(max - upperWhisker);

        return distance > maxDistance ? value : max;
      });

      discardedItemsAux.push(farthestOutlier);
      remainingItemsAux = remainingItemsAux.filter(
        (value) => value !== farthestOutlier
      );
    }

    return [remainingItemsAux, discardedItemsAux];
  };

  return (
    <div className={`${styles.content}`}>
      <h2 className={`${styles.h2}`}>What is it about?</h2>
      <p>
        When a dataset is entered as input, this filter will calculate
        iteratively percentiles 25, 50, 75, IQR, whiskers and outliers of a
        boxplot chart. On every iteration the furthest outlier will be cut off.
        The result will be the following information for each iteration:
      </p>
      <ul className={`${styles.ul}`}>
        <li>Mean</li>
        <li>Median</li>
        <li>Standar Deviation</li>
        <li>Lower Whisker</li>
        <li>Upper Whisker</li>
        <li>Outliers List</li>
        <li>Remaining Items List</li>
        <li>Boxplot</li>
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
                  <th>Media</th>
                  <th>Median</th>
                  <th>Lower Whisker</th>
                  <th>Upper Whisker</th>
                  <th>Removed Item List</th>
                  <th>Remaining Items (Amount)</th>
                </tr>
              </thead>
              <tbody>
                {iterationsData.means.map((_, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{iterationsData.means[index].toFixed(4)}</td>
                    <td>{iterationsData.quartiles50[index].toFixed(4)}</td>
                    <td>{iterationsData.lowerWhiskers[index].toFixed(4)}</td>
                    <td>{iterationsData.upperWhiskers[index].toFixed(4)}</td>
                    <td>{iterationsData.discardedItems[index].join(", ")}</td>
                    <td>{iterationsData.remainingItems[index].length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <hr />
          <h2>Evolution Of Data Through Iterations</h2>
          <Boxplot
            key={JSON.stringify(iterationsData.remainingItems)}
            dataset={iterationsData}
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
