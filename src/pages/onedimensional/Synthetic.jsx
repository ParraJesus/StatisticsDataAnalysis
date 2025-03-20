import React, { useState } from "react";
import BarChart from "../../components/Histogram";
import Boxplot from "../../components/Boxplot";

import styles from "../../stylesheets/Layout.module.css";
import formStyles from "../../stylesheets/Form.module.css";
import tableStyles from "../../stylesheets/Table.module.css";

const Page = () => {
  //Inputs Data
  const [rawDataSet, setRawDataSet] = useState([]);
  const [groupsAmount, setGroupsAmount] = useState([]);
  const [syntheticDataAmount, setSyntheticDataAmount] = useState([]);
  const [userPercentileNumber, setUserPercentileNumber] = useState(32);

  //Calculations Data
  const [tabulationData, setTabulationData] = useState({
    groups: [],
    groupMarks: [],
    absoluteFrecuencies: [],
    cumulativeAbsoluteFrecuencies: [],
    relativeFrecuencies: [],
    cumulativeRelativeFrecuencies: [],
  });
  const [syntheticDataSet, setSyntheticDataSet] = useState([]);
  const [comparativeData, setComparativeData] = useState({
    labels: [],
    means: [],
    medians: [],
    variance: [],
    standarDeviations: [],
    percentiles10: [],
    percentiles25: [],
    percentiles75: [],
    percentiles90: [],
    userPercentiles: [],
  });
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

  //Flow Control Data
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

    setTabulationData({
      groups,
      groupMarks,
      absoluteFrecuencies,
      cumulativeAbsoluteFrecuencies,
      relativeFrecuencies,
      cumulativeRelativeFrecuencies,
    });

    //Synthetic
    const synthethicDataAux = generateSyntheticData(
      relativeFrecuencies,
      groups
    );
    setSyntheticDataSet(synthethicDataAux);

    //histogram
    const histogramDataAux = [];
    histogramDataAux.push(dataset);
    histogramDataAux.push(synthethicDataAux);
    setHistogramData(histogramDataAux);
    //Boxplot
    let mean = calculateMean(dataset);
    let percentile25 = calculateQuartile(dataset, 1);
    let percentile50 = calculateQuartile(dataset, 2);
    let percentile75 = calculateQuartile(dataset, 3);
    let [upperWhisker, lowerWhisker] = calculateWhiskers(
      dataset,
      percentile25,
      percentile75
    );
    let [remainingItems, discardedItems] = findOutliers(
      dataset,
      upperWhisker,
      lowerWhisker
    );

    let meanS = calculateMean(synthethicDataAux);
    let percentile25S = calculateQuartile(synthethicDataAux, 1);
    let percentile50S = calculateQuartile(synthethicDataAux, 2);
    let percentile75S = calculateQuartile(synthethicDataAux, 3);
    let [upperWhiskerS, lowerWhiskerS] = calculateWhiskers(
      synthethicDataAux,
      percentile25S,
      percentile75S
    );
    let [remainingItemsS, discardedItemsS] = findOutliers(
      synthethicDataAux,
      upperWhiskerS,
      lowerWhiskerS
    );

    setBoxplotData({
      lowerWhiskers: [lowerWhisker, lowerWhiskerS],
      quartiles25: [percentile25, percentile25S],
      quartiles50: [percentile50, percentile50S],
      quartiles75: [percentile75, percentile75S],
      upperWhiskers: [upperWhisker, upperWhiskerS],
      means: [mean, meanS],
      remainingItems: [remainingItems, remainingItemsS],
      discardedItems: [discardedItems, discardedItemsS],
    });

    //Comparative
    const labels = ["Raw Data", "Tabulated Data", "Synthetic Data"];
    const means = [];
    const medians = [];
    const variances = [];
    const standarDeviations = [];
    const percentiles10 = [];
    const percentiles25 = [];
    const percentiles75 = [];
    const percentiles90 = [];
    const userPercentiles = [];

    const meanT = calculateMeanFromTable(
      groups.length,
      groupMarks,
      absoluteFrecuencies
    );
    means.push(mean);
    means.push(meanT);
    means.push(meanS);

    const median = calculateMedian(dataset);
    const medianS = calculateMedian(synthethicDataAux);
    const medianT = calculateMedianFromTable(
      groups,
      groups.length,
      absoluteFrecuencies,
      cumulativeAbsoluteFrecuencies
    );
    medians.push(median);
    medians.push(medianT);
    medians.push(medianS);

    const std = calculateStandardDeviation(dataset, mean);
    const stdS = calculateStandardDeviation(synthethicDataAux, meanS);

    const varianceT = calculateVarianceFromTable(
      groups.length,
      groupMarks,
      absoluteFrecuencies
    );
    const stdT = calculateStandardDeviationFromTable(varianceT);

    variances.push(std ** 2);
    variances.push(varianceT);
    variances.push(stdS ** 2);

    standarDeviations.push(std);
    standarDeviations.push(stdT);
    standarDeviations.push(stdS);

    const p10 = calculatePercentile(dataset, 10);
    const p10S = calculatePercentile(synthethicDataAux, 10);
    const p10T = calculatePercentileFromTable(
      10,
      groups,
      groups.length,
      absoluteFrecuencies,
      cumulativeAbsoluteFrecuencies
    );
    percentiles10.push(p10);
    percentiles10.push(p10T);
    percentiles10.push(p10S);

    const p25 = calculatePercentile(dataset, 25);
    const p25S = calculatePercentile(synthethicDataAux, 25);
    const p25T = calculatePercentileFromTable(
      25,
      groups,
      groups.length,
      absoluteFrecuencies,
      cumulativeAbsoluteFrecuencies
    );
    percentiles25.push(p25);
    percentiles25.push(p25T);
    percentiles25.push(p25S);

    const p75 = calculatePercentile(dataset, 75);
    const p75S = calculatePercentile(synthethicDataAux, 75);
    const p75T = calculatePercentileFromTable(
      75,
      groups,
      groups.length,
      absoluteFrecuencies,
      cumulativeAbsoluteFrecuencies
    );
    percentiles75.push(p75);
    percentiles75.push(p75T);
    percentiles75.push(p75S);

    const p90 = calculatePercentile(dataset, 90);
    const p90S = calculatePercentile(synthethicDataAux, 90);
    const p90T = calculatePercentileFromTable(
      90,
      groups,
      groups.length,
      absoluteFrecuencies,
      cumulativeAbsoluteFrecuencies
    );
    percentiles90.push(p90);
    percentiles90.push(p90T);
    percentiles90.push(p90S);

    const pU = calculatePercentile(dataset, userPercentileNumber);
    const pUS = calculatePercentile(synthethicDataAux, userPercentileNumber);
    const pUT = calculatePercentileFromTable(
      userPercentileNumber,
      groups,
      groups.length,
      absoluteFrecuencies,
      cumulativeAbsoluteFrecuencies
    );
    userPercentiles.push(pU);
    userPercentiles.push(pUT);
    userPercentiles.push(pUS);

    setComparativeData({
      labels: labels,
      means: means,
      medians: medians,
      variance: variances,
      standarDeviations: standarDeviations,
      percentiles10: percentiles10,
      percentiles25: percentiles25,
      percentiles75: percentiles75,
      percentiles90: percentiles90,
      userPercentiles: userPercentiles,
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

  //Synthetic
  const generateSyntheticData = (relativeFrecuencies, groups) => {
    let syntheticData = [];
    let dataAmountPerGroup = [];
    let dataAux = [];

    for (let i = 0; i < groupsAmount; i++) {
      dataAmountPerGroup.push(
        Math.floor(relativeFrecuencies[i] * syntheticDataAmount)
      );
    }

    for (let i = 0; i < groupsAmount; i++) {
      let a = groups[i][0];
      let b = groups[i][1];
      dataAux = Array.from({ length: dataAmountPerGroup[i] }, () =>
        parseFloat((a + (b - a) * Math.random()).toFixed(2))
      );
      syntheticData.push(...dataAux);
    }

    return syntheticData;
  };

  //Boxplot
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

  //Comparative
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

  const calculatePercentile = (dataset, percentile) => {
    if (dataset.length === 0) return null;
    if (percentile < 0 || percentile > 100)
      throw new Error("El percentil debe estar entre 0 y 100.");

    dataset = [...dataset].sort((a, b) => a - b);

    let index = (percentile / 100) * (dataset.length - 1);

    if (Number.isInteger(index)) {
      return dataset[index];
    } else {
      let lower = Math.floor(index);
      let upper = Math.ceil(index);
      return (
        dataset[lower] + (index - lower) * (dataset[upper] - dataset[lower])
      );
    }
  };

  const calculateMeanFromTable = (
    groupAmount,
    groupMarkSet,
    absoluteFrequencySet
  ) => {
    let total = 0;
    let totalFrequency = 0;

    for (let i = 0; i < groupAmount; i++) {
      total += groupMarkSet[i] * absoluteFrequencySet[i]; // Σ(xi * fi)
      totalFrequency += absoluteFrequencySet[i]; // Σfi
    }

    return total / totalFrequency;
  };

  const calculateMedianFromTable = (
    groupsSet,
    groupAmount,
    absoluteFrequencySet,
    absoluteFrequencyCumulativeSet
  ) => {
    let totalFrequency = absoluteFrequencyCumulativeSet[groupAmount - 1]; // Total de datos
    let medianClassIndex = absoluteFrequencyCumulativeSet.findIndex(
      (f) => f >= totalFrequency / 2
    ); // Encuentra la clase donde cae la mediana

    if (medianClassIndex === -1) return null;

    let L = groupsSet[medianClassIndex][0]; // Límite inferior de la clase mediana
    let F =
      medianClassIndex > 0
        ? absoluteFrequencyCumulativeSet[medianClassIndex - 1]
        : 0; // Frecuencia acumulada anterior
    let f = absoluteFrequencySet[medianClassIndex]; // Frecuencia de la clase mediana
    let h = groupsSet[medianClassIndex][1] - groupsSet[medianClassIndex][0]; // Amplitud de clase

    return L + ((totalFrequency / 2 - F) / f) * h;
  };

  const calculateVarianceFromTable = (
    groupAmount,
    groupMarkSet,
    absoluteFrequencySet
  ) => {
    let mean = calculateMeanFromTable(
      groupAmount,
      groupMarkSet,
      absoluteFrequencySet
    );
    let total = 0;
    let totalFrequency = 0;

    for (let i = 0; i < groupAmount; i++) {
      total += absoluteFrequencySet[i] * Math.pow(groupMarkSet[i] - mean, 2); // Σfi * (xi - μ)²
      totalFrequency += absoluteFrequencySet[i];
    }

    return total / totalFrequency;
  };

  const calculateStandardDeviationFromTable = (variance) => {
    return Math.sqrt(variance);
  };

  const calculatePercentileFromTable = (
    percentile,
    groupsSet,
    groupAmount,
    absoluteFrequencySet,
    absoluteFrequencyCumulativeSet
  ) => {
    let totalFrequency = absoluteFrequencyCumulativeSet[groupAmount - 1]; // Total de datos
    let percentilePosition = (percentile / 100) * totalFrequency; // Posición en la distribución

    let classIndex = absoluteFrequencyCumulativeSet.findIndex(
      (f) => f >= percentilePosition
    ); // Encuentra la clase del percentil

    if (classIndex === -1) return null;

    let L = groupsSet[classIndex][0]; // Límite inferior de la clase percentil
    let F = classIndex > 0 ? absoluteFrequencyCumulativeSet[classIndex - 1] : 0; // Frecuencia acumulada anterior
    let f = absoluteFrequencySet[classIndex]; // Frecuencia de la clase
    let h = groupsSet[classIndex][1] - groupsSet[classIndex][0]; // Amplitud de clase

    return L + ((percentilePosition - F) / f) * h;
  };

  return (
    <div className={`${styles.content}`}>
      <h2 className={`${styles.h2}`}>What is it about?</h2>
      <p>
        <strong>Expected Input:</strong>
      </p>
      <ul className={`${styles.ul}`}>
        <li>
          A numerical dataset in the form of an array (e.g., [x1, x2, x3, x4,
          x5, x6, x7, x8, ...]) or a data column, similar to MATLAB or Excel
          formatting
        </li>
        <li>Number of classes to group the data into</li>
        <li>Number of synthetic data points to generate</li>
        <li>A percentile value to compare against</li>
      </ul>
      <p>
        <strong>Process:</strong> <br />
        Using the input data, the tool generates a frequency table that includes
        Classes, Class Marks, Absolute Frequencies, Cumulative Absolute
        Frequencies, and Relative Frequencies. It then generates a synthetic
        dataset that mimics the statistical behavior of the original data.
        Additionally, a comparison table is created between the original data,
        tabulated data, and synthetic data, including the following statistics:
        Mean, Median, Variance, Standard Deviation, 10th Percentile, 25th
        Percentile, 75th Percentile, 90th Percentile, and the user-defined
        percentile. <br /> <br /> <strong>Expected Output:</strong>
      </p>
      <ul className={`${styles.ul}`}>
        <li>Classes</li>
        <li>Class marks</li>
        <li>Absolute frecuency</li>
        <li>Cumulative absolute frecuency</li>
        <li>Relative frecuency</li>
        <li>Cumulative relative frecuency</li>
        <li>Raw dataset histogram</li>
        <li>Synthetic dataset histogram</li>
        <li>Raw dataset boxplot</li>
        <li>Synthetic dataset boxplot</li>
        <li>Synthetic dataset amount and list</li>
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
        <label htmlFor="syntheticAmountInput" className={`${formStyles.label}`}>
          {"Amount of synthetic data"}
          <input
            className={`${formStyles.input}`}
            type="number"
            name="syntheticAmountInput"
            id="syntheticAmountInput"
            placeholder="..."
            onChange={(e) => {
              setHasDataInputUpdated(true);
              setSyntheticDataAmount(e.target.value);
            }}
          />
        </label>
        <label htmlFor="userPercentileInput" className={`${formStyles.label}`}>
          {"Data Percentile to calculate"}
          <input
            className={`${formStyles.input}`}
            type="number"
            name="userPercentileInput"
            id="userPercentileInput"
            placeholder="..."
            onChange={(e) => {
              setHasDataInputUpdated(true);
              setUserPercentileNumber(e.target.value);
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
                  <th>Cumulative Relative Frecuencies</th>
                </tr>
              </thead>
              <tbody>
                {tabulationData.groups.map((_, index) => (
                  <tr key={index}>
                    <td>{`[${tabulationData.groups[index][0].toFixed(
                      2
                    )}, ${tabulationData.groups[index][1].toFixed(2)})`}</td>
                    <td>{tabulationData.groupMarks[index].toFixed(4)}</td>
                    <td>{tabulationData.absoluteFrecuencies[index]}</td>
                    <td>
                      {tabulationData.cumulativeAbsoluteFrecuencies[index]}
                    </td>
                    <td>
                      {tabulationData.relativeFrecuencies[index].toFixed(4)}
                    </td>
                    <td>
                      {tabulationData.cumulativeRelativeFrecuencies[
                        index
                      ].toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <hr />
          <h2>Histograms</h2>
          <BarChart
            key={JSON.stringify(histogramData[0])}
            datasets={histogramData}
            groupsAmount={tabulationData.groups.length}
            includeControls={true}
          />
          <hr />
          <h2>Boxplots</h2>
          <Boxplot
            key={JSON.stringify(boxplotData.remainingItems)}
            dataset={boxplotData}
            includeControls={true}
          />
          <hr />
          <h2>Synthetic Data Generated</h2>
          <textarea
            name="resultingDataTextArea"
            id="resultingDataTextArea"
            readOnly
            className={`${formStyles.textArea}`}
            value={`Amount: ${syntheticDataSet.length} \n [${syntheticDataSet}]`}
          ></textarea>
          <hr />
          <h2>Comparison Table</h2>
          <div className={`${tableStyles.table_container}`}>
            <table className={`${tableStyles.table}`} id="dataTable">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Mean</th>
                  <th>Median</th>
                  <th>Variance</th>
                  <th>Standar Deviation</th>
                  <th>Percentil 10</th>
                  <th>Percentil 25</th>
                  <th>Percentil 75</th>
                  <th>Percentil 90</th>
                  <th>{`Percentil ${userPercentileNumber}`}</th>
                </tr>
              </thead>
              <tbody>
                {comparativeData.labels.map((_, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{comparativeData.labels[index]}</strong>
                    </td>
                    <td>{comparativeData.means[index].toFixed(4)}</td>
                    <td>{comparativeData.medians[index].toFixed(4)}</td>
                    <td>{comparativeData.variance[index].toFixed(4)}</td>
                    <td>
                      {comparativeData.standarDeviations[index].toFixed(4)}
                    </td>
                    <td>{comparativeData.percentiles10[index].toFixed(4)}</td>
                    <td>{comparativeData.percentiles25[index].toFixed(4)}</td>
                    <td>{comparativeData.percentiles75[index].toFixed(4)}</td>
                    <td>{comparativeData.percentiles90[index].toFixed(4)}</td>
                    <td>{comparativeData.userPercentiles[index].toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <hr />
        </>
      )}
    </div>
  );
};

export default Page;
