import React, { useState } from "react";
import BarChart from "../../components/Histogram";
import Boxplot from "../../components/Boxplot";

import styles from "../../stylesheets/Layout.module.css";
import formStyles from "../../stylesheets/Form.module.css";
import tableStyles from "../../stylesheets/Table.module.css";

const Page = () => {
  const [rawDataSet, setRawDataSet] = useState([]);
  const [groupsAmount, setGroupsAmount] = useState([]);
  const [calculatedData, setCalculatedData] = useState([
    {
      groups: [],
      groupMarks: [],
      absoluteFrecuencies: [],
      cumulativeAbsoluteFrecuencies: [],
      relativeFrecuencies: [],
      cumulativeRelativeFrecuencies: [],
    },
  ]);
  const [boxplotData, setBoxplotData] = useState({
    lowerWhiskers: [],
    quartiles25: [],
    quartiles50: [],
    quartiles75: [],
    upperWhiskers: [],
    means: [],
    remainingItems: [],
    discardedItems: [],
  });
  const [histogramData, setHistogramData] = useState([]);

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
    //Tabulation
    const groups = calculateGroups(dataset);
    const groupMarks = calculateGroupMark(groups);
    const absoluteFrecuencies = calculateAbsoluteFrequency(dataset, groups);
    const cumulativeAbsoluteFrecuencies =
      calculateCumulativeAbsoluteFrequency(absoluteFrecuencies);
    const relativeFrecuencies = calculateRelativeFrequency(
      dataset,
      absoluteFrecuencies
    );
    const cumulativeRelativeFrecuencies =
      calculateCumulativeRelativeFrequency(relativeFrecuencies);

    //Histogram
    setHistogramData([dataset, []]);

    //Boxplot
    const means = calculateMean(dataset);
    const quartiles25 = calculateQuartile(dataset, 1);
    const quartiles50 = calculateQuartile(dataset, 2);
    const quartiles75 = calculateQuartile(dataset, 3);
    const [upperWhiskers, lowerWhiskers] = calculateWhiskers(
      dataset,
      quartiles25,
      quartiles75
    );
    const [remainingItems, discardedItems] = findOutliers(
      dataset,
      upperWhiskers,
      lowerWhiskers
    );

    setBoxplotData({
      lowerWhiskers: [lowerWhiskers, 0],
      quartiles25: [quartiles25, 0],
      quartiles50: [quartiles50, 0],
      quartiles75: [quartiles75, 0],
      upperWhiskers: [upperWhiskers, 0],
      means: [means, 0],
      remainingItems: [remainingItems, []],
      discardedItems: [discardedItems, []],
    });

    setCalculatedData({
      groups,
      groupMarks,
      absoluteFrecuencies,
      cumulativeAbsoluteFrecuencies,
      relativeFrecuencies,
      cumulativeRelativeFrecuencies,
    });
  };

  //Tabulation
  const calculateGroups = (dataset) => {
    const min = Math.min(...dataset);
    const max = Math.max(...dataset);
    const interval = (max - min) / groupsAmount;

    let groups = [];
    for (let i = 0; i < groupsAmount; i++) {
      let lowerBound = min + i * interval;
      let upperBound = lowerBound + interval;
      if (i === groupsAmount - 1) upperBound = max;
      groups.push([lowerBound, upperBound]);
    }
    return groups;
  };

  const calculateGroupMark = (groups) => {
    return groups.map(([lower, upper]) => (lower + upper) / 2);
  };

  const calculateAbsoluteFrequency = (dataset, groups) => {
    const groupAmount = groups.length;
    let frequencies = new Array(groupAmount).fill(0);
    dataset.forEach((value) => {
      for (let i = 0; i < groups.length; i++) {
        if (
          value >= groups[i][0] &&
          (i === groups.length - 1
            ? value <= groups[i][1]
            : value < groups[i][1])
        ) {
          frequencies[i]++;
          break;
        }
      }
    });

    return frequencies;
  };

  const calculateCumulativeAbsoluteFrequency = (absoluteFrequencies) => {
    let cumulative = [];
    absoluteFrequencies.reduce((sum, freq, i) => {
      cumulative[i] = sum + freq;
      return cumulative[i];
    }, 0);
    return cumulative;
  };

  const calculateRelativeFrequency = (dataset, absoluteFrequencies) => {
    const total = dataset.length;
    return absoluteFrequencies.map((freq) => freq / total);
  };

  const calculateCumulativeRelativeFrequency = (relativeFrecuencies) => {
    let cumulative = [];
    relativeFrecuencies.reduce((sum, freq, i) => {
      cumulative[i] = sum + freq;
      return cumulative[i];
    }, 0);
    return cumulative;
  };

  //Boxplot Data
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
    if (dataset.length === 0) return { remaining: [], outliers: [] };

    const remaining = [];
    const outliers = [];

    dataset.forEach((value) => {
      if (value >= lowerWhisker && value <= upperWhisker) {
        remaining.push(value);
      } else {
        outliers.push(value);
      }
    });

    return [remaining, outliers];
  };

  return (
    <div className={`${styles.content}`}>
      <h2 className={`${styles.h2}`}>What is it about?</h2>
      <p>
        When entering a data set into the input, the fields of a frequency table
        will be dynamically calculated, grouping by the number of tuples
        entered. Upon completion of the computations, the following will be
        delivered:
      </p>
      <ul className={`${styles.ul}`}>
        <li>Classes</li>
        <li>Class Marks</li>
        <li>Absolute Frecuency</li>
        <li>Cumulative Absolute Frecuency</li>
        <li>Relative Frecuency</li>
        <li>Cumulative Relative Frecuency</li>
        <li>Histogram</li>
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
        <label htmlFor="groupAmountInput" className={`${formStyles.label}`}>
          {"Number of groups"}
          <input
            className={`${formStyles.input}`}
            type="number"
            name="groupAmountInput"
            id="groupAmountInput"
            placeholder="..."
            onChange={(e) => {
              setHasDataInputUpdated(true);
              setGroupsAmount(e.target.value);
            }}
          />
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
          <h2>Frecuencies Table</h2>
          <div className={`${tableStyles.table_container}`}>
            <table className={`${tableStyles.table}`} id="dataTable">
              <thead>
                <tr>
                  <th>Classes</th>
                  <th>Class Mark</th>
                  <th>Absolute Frecuencies</th>
                  <th>Cumulative Absolute Frecuencies</th>
                  <th>Relative Frecuencies</th>
                  <th>Relative Frecuencies</th>
                </tr>
              </thead>
              <tbody>
                {calculatedData.groups.map((_, index) => (
                  <tr key={index}>
                    <td>{`[${calculatedData.groups[index][0].toFixed(
                      2
                    )}, ${calculatedData.groups[index][1].toFixed(2)})`}</td>
                    <td>{calculatedData.groupMarks[index].toFixed(4)}</td>
                    <td>{calculatedData.absoluteFrecuencies[index]}</td>
                    <td>
                      {calculatedData.cumulativeAbsoluteFrecuencies[index]}
                    </td>
                    <td>
                      {calculatedData.relativeFrecuencies[index].toFixed(4)}
                    </td>
                    <td>
                      {calculatedData.cumulativeRelativeFrecuencies[
                        index
                      ].toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <hr />
          <h2>Histogram</h2>
          <BarChart
            key={JSON.stringify(calculatedData.groups)}
            groupsAmount={calculatedData.groups.length}
            datasets={histogramData}
            includeControls={false}
          />
          <hr />
          <h2>Boxplot</h2>
          <Boxplot
            key={JSON.stringify(boxplotData.remainingItems)}
            dataset={boxplotData}
            includeControls={false}
          />
          <hr />
        </>
      )}
    </div>
  );
};

export default Page;
