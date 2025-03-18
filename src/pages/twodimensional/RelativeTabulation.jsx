import React, { useState } from "react";
import { isArray } from "chart.js/helpers";

import styles from "../../stylesheets/Layout.module.css";
import formStyles from "../../stylesheets/Form.module.css";
import tableStyles from "../../stylesheets/Table.module.css";

const Page = () => {
  const [rawDataSet, setRawDataSet] = useState([]);
  const [groupsAmount1, setGroupsAmount1] = useState(5);
  const [groupsAmount2, setGroupsAmount2] = useState(5);
  const [inputString, setInputString] = useState("");
  const [absoluteTableData, setAbsoluteTableData] = useState({
    groupsx: [],
    groupsy: [],
    frequencyMatrix: [],
    rowTotals: [],
    colTotals: [],
    grandTotal: 0,
  });
  const [relativeTableData, setRelativeTableData] = useState({
    groupsx: [],
    groupsy: [],
    relativesMatrix: [],
    rowTotals: [],
    colTotals: [],
    grandTotal: 0,
  });
  const [caculationsData, setCaculationsData] = useState({
    labels: [],
    means: [],
    medians: [],
    variances: [],
    stds: [],
  });

  const [toggleContent, setToggleContent] = useState(false);
  const [hasDataInputUpdated, setHasDataInputUpdated] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasDataInputUpdated(false);

    const [processedData, formattedData] = parseFlexibleDataSets(
      rawDataSet.length > 0 ? rawDataSet : [[0], [0]],
      2
    );

    if (isArray(processedData[0]) && isArray(processedData[1])) {
      setRawDataSet([processedData[0], processedData[1]]);
      setInputString(formattedData);
      calculateData([processedData[0], processedData[1]]);
      setToggleContent(true);
    }
  };

  const calculateData = (datasets) => {
    const groupsx = calculateGroups(datasets[0], groupsAmount1);
    const groupsy = calculateGroups(datasets[1], groupsAmount2);

    const [frequencyMatrix, rowTotals, colTotals, grandTotal] =
      calculateAbsoluteFrequencyTable(datasets, groupsx, groupsy);

    const absoluteData = {
      groupsx,
      groupsy,
      frequencyMatrix,
      rowTotals,
      colTotals,
      grandTotal,
    };

    setAbsoluteTableData(absoluteData);
    calculateRelativeTableData(absoluteData);

    const labels = [];
    const means = [];
    const medians = [];
    const variances = [];
    const stds = [];

    labels.push("X");
    labels.push("Y");
    means.push(calculateMean(datasets[0]));
    means.push(calculateMean(datasets[1]));
    medians.push(calculateMedian(datasets[0]));
    medians.push(calculateMedian(datasets[1]));
    variances.push(calculateVariance(datasets[0]));
    variances.push(calculateVariance(datasets[1]));
    stds.push(calculateStandardDeviation(datasets[0]));
    stds.push(calculateStandardDeviation(datasets[1]));

    setCaculationsData({
      labels,
      means,
      medians,
      variances,
      stds,
    });
  };

  //Input
  const parseFlexibleDataSets = (input, numLists = 2) => {
    let processedData;

    if (Array.isArray(input) && Array.isArray(input[0])) {
      processedData = input;
    } else if (typeof input === "string") {
      const dataGroups = input.match(/[([]([^)()[\]]+)[)\]]/g);

      if (dataGroups) {
        processedData = dataGroups.map((group) =>
          group
            .replace(/[()\[\]]/g, "")
            .split(/[\s,]+/)
            .map((num) => parseFloat(num.trim()))
            .filter((num) => !isNaN(num))
        );

        // Si solo hay una lista, genera las listas faltantes llenas de ceros
        if (processedData.length === 1 && numLists > 1) {
          const dataLength = processedData[0].length;
          const extraColumns = Array.from({ length: numLists - 1 }, () =>
            Array(dataLength).fill(0)
          );
          processedData = [processedData[0], ...extraColumns];
        }
      } else {
        const rows = input
          .trim()
          .split("\n")
          .map((line) =>
            line
              .trim()
              .split(/[\s,]+/)
              .map((num) => parseFloat(num))
          );

        const allSameLength = rows.every(
          (row) => row.length === rows[0].length
        );
        if (!allSameLength) {
          console.error("Las filas no tienen la misma longitud.");
          return [[], "Error: Filas desiguales"];
        }

        const transposedData = rows[0].map((_, colIndex) =>
          rows.map((row) => row[colIndex])
        );

        if (transposedData.length < numLists) {
          if (transposedData.length === 1) {
            // Si solo hay una columna, genera columnas extra de ceros
            const extraColumns = Array.from({ length: numLists - 1 }, () =>
              Array(rows.length).fill(0)
            );
            processedData = [transposedData[0], ...extraColumns];
          } else {
            console.error(
              "No hay suficientes columnas para dividir en la cantidad solicitada."
            );
            return [[], "Error: No hay suficientes columnas"];
          }
        } else {
          processedData = transposedData.slice(0, numLists);
        }
      }
    }

    const formattedString = processedData
      .map((set) => `[${set.join(",")}]`)
      .join(", ");

    return [processedData, formattedString];
  };

  //Tables
  const calculateGroups = (dataset, groupsAmount) => {
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

  const calculateAbsoluteFrequencyTable = (dataset, groups1, groups2) => {
    const frequencyMatrix = Array.from({ length: groups1.length }, () =>
      Array(groups2.length).fill(0)
    );
    dataset[0].forEach((valueX, index) => {
      const valueY = dataset[1][index];

      let rowIndex = -1;
      let colIndex = -1;

      for (let i = 0; i < groups1.length; i++) {
        if (
          valueX >= groups1[i][0] &&
          (i === groups1.length - 1
            ? valueX <= groups1[i][1]
            : valueX < groups1[i][1])
        ) {
          rowIndex = i;
          break;
        }
      }
      for (let j = 0; j < groups2.length; j++) {
        if (
          valueY >= groups2[j][0] &&
          (j === groups2.length - 1
            ? valueY <= groups2[j][1]
            : valueY < groups2[j][1])
        ) {
          colIndex = j;
          break;
        }
      }
      if (rowIndex !== -1 && colIndex !== -1) {
        frequencyMatrix[rowIndex][colIndex]++;
      }
    });

    const rowTotals = frequencyMatrix.map((row) =>
      row.reduce((a, b) => a + b, 0)
    );
    const colTotals = Array(groups2.length).fill(0);
    frequencyMatrix.forEach((row) =>
      row.forEach((count, j) => (colTotals[j] += count))
    );
    const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

    return [frequencyMatrix, rowTotals, colTotals, grandTotal];
  };

  const calculateRelativeTableData = (absoluteTableData) => {
    const {
      frequencyMatrix,
      rowTotals,
      colTotals,
      grandTotal,
      groupsx,
      groupsy,
    } = absoluteTableData;

    if (grandTotal === 0) return;

    const relativesMatrix = frequencyMatrix.map((row) =>
      row.map((count) => (count / grandTotal).toFixed(4))
    );

    const relativeRowTotals = rowTotals.map((total) =>
      (total / grandTotal).toFixed(4)
    );
    const relativeColTotals = colTotals.map((total) =>
      (total / grandTotal).toFixed(4)
    );

    setRelativeTableData({
      groupsx,
      groupsy,
      relativesMatrix,
      rowTotals: relativeRowTotals,
      colTotals: relativeColTotals,
      grandTotal: 1,
    });
  };

  //Caculations
  const calculateMean = (data) => {
    const sum = data.reduce((total, num) => total + num, 0);
    return (sum / data.length).toFixed(2);
  };

  const calculateMedian = (data) => {
    const sortedData = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sortedData.length / 2);

    return (
      sortedData.length % 2 !== 0
        ? sortedData[mid]
        : (sortedData[mid - 1] + sortedData[mid]) / 2
    ).toFixed(2);
  };

  const calculateVariance = (data, isSample = false) => {
    const mean = parseFloat(calculateMean(data));
    const squaredDiffs = data.map((num) => Math.pow(num - mean, 2));
    const divisor = isSample ? data.length - 1 : data.length;

    return (squaredDiffs.reduce((a, b) => a + b, 0) / divisor).toFixed(2);
  };

  const calculateStandardDeviation = (data, isSample = false) => {
    return Math.sqrt(calculateVariance(data, isSample)).toFixed(2);
  };

  return (
    <div className={`${styles.content}`}>
      <h2 className={`${styles.h2}`}>What is it about?</h2>
      <p>
        When a two-dimensional dataset and the number of groups for both
        variables are entered into the inputs, the data will be grouped by
        intervals. Upon completion of the calculations, the following will be
        returned:
      </p>
      <ul className={`${styles.ul}`}>
        <li>Absolute Frecuencies Table</li>
        <li>Relative Frecuencies Table</li>
        <li>Means</li>
        <li>Medians</li>
        <li>Variances</li>
        <li>Standar Deviations</li>
      </ul>
      <hr />
      <form onSubmit={handleSubmit} className={`${formStyles.form}`}>
        <label htmlFor="rawdatasetInput" className={`${formStyles.label}`}>
          {"Two-Dimensional Dataset"}
          <textarea
            className={`${formStyles.textArea}`}
            name="rawdatasetInput"
            id="rawdatasetInput"
            placeholder="..."
            value={inputString}
            onChange={(e) => {
              setHasDataInputUpdated(true);
              setRawDataSet(e.target.value);
              setInputString(e.target.value);
            }}
          ></textarea>
        </label>
        <label htmlFor="groupAmount1Input" className={`${formStyles.label}`}>
          {"First Variable Number of Classes"}
          <input
            className={`${formStyles.input}`}
            type="number"
            name="groupAmount1Input"
            id="groupAmount1Input"
            placeholder="..."
            onChange={(e) => {
              setHasDataInputUpdated(true);
              setGroupsAmount1(e.target.value);
            }}
          />
        </label>
        <label htmlFor="groupAmount2Input" className={`${formStyles.label}`}>
          {"Second Variable Number of Classes"}
          <input
            className={`${formStyles.input}`}
            type="number"
            name="groupAmount2Input"
            id="groupAmount2Input"
            placeholder="..."
            onChange={(e) => {
              setHasDataInputUpdated(true);
              setGroupsAmount2(e.target.value);
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
          <h2>Absolute Frecuencies Table</h2>
          <div className={`${tableStyles.table_container}`}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>X / Y</th>
                  {absoluteTableData.groupsy.map((g, index) => (
                    <th key={index}>{`[${g[0].toFixed(2)}, ${g[1].toFixed(
                      2
                    )})`}</th>
                  ))}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {absoluteTableData.groupsx.map((g1, rowIndex) => (
                  <tr key={rowIndex}>
                    <td
                      className={`${tableStyles.highlighted_row}`}
                    >{`[${g1[0].toFixed(2)}, ${g1[1].toFixed(2)})`}</td>
                    {absoluteTableData.frequencyMatrix[rowIndex].map(
                      (value, colIndex) => (
                        <td key={colIndex}>{value}</td>
                      )
                    )}
                    <td>
                      <strong>{absoluteTableData.rowTotals[rowIndex]}</strong>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className={`${tableStyles.highlighted_row}`}>
                    <strong>Total</strong>
                  </td>
                  {absoluteTableData.colTotals.map((total, index) => (
                    <td key={index}>
                      <strong>{total}</strong>
                    </td>
                  ))}
                  <td>
                    <strong>{absoluteTableData.grandTotal}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <hr />
          <h2>Relative Frecuencies Table</h2>
          <div className={`${tableStyles.table_container}`}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>X / Y</th>
                  {relativeTableData.groupsy.map((g, index) => (
                    <th key={index}>{`[${g[0].toFixed(2)}, ${g[1].toFixed(
                      2
                    )})`}</th>
                  ))}
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {relativeTableData.groupsx.map((g1, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className={`${tableStyles.highlighted_row}`}>
                      {`[${g1[0].toFixed(2)}, ${g1[1].toFixed(2)})`}
                    </td>

                    {relativeTableData.relativesMatrix[rowIndex].map(
                      (value, colIndex) => (
                        <td key={colIndex}>{value}</td>
                      )
                    )}

                    <td>
                      <strong>{relativeTableData.rowTotals[rowIndex]}</strong>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className={`${tableStyles.highlighted_row}`}>
                    <strong>Total</strong>
                  </td>
                  {relativeTableData.colTotals.map((total, index) => (
                    <td key={index}>
                      <strong>{total}</strong>
                    </td>
                  ))}
                  <td>
                    <strong>{relativeTableData.grandTotal}</strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <hr />
          <h2>Data Calculations</h2>
          <div className={`${tableStyles.table_container}`}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Dataset</th>
                  <th>Mean</th>
                  <th>Median</th>
                  <th>Variance</th>
                  <th>Standar Deviation</th>
                </tr>
              </thead>
              <tbody>
                {caculationsData.labels.map((_, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{caculationsData.labels[index]}</strong>
                    </td>
                    <td>{caculationsData.means[index]}</td>
                    <td>{caculationsData.medians[index]}</td>
                    <td>{caculationsData.variances[index]}</td>
                    <td>{caculationsData.stds[index]}</td>
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
