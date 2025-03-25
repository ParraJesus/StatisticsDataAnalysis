import React, { useState } from "react";
import { isArray } from "chart.js/helpers";
import { jStat } from "jstat";

import styles from "../../stylesheets/Layout.module.css";
import formStyles from "../../stylesheets/Form.module.css";
import tableStyles from "../../stylesheets/Table.module.css";
import CollapsibleSection from "../../components/CollapsibleSection";
import Chart from "../../components/chart";

const Page = () => {
  const [rawDataSet, setRawDataSet] = useState([]);
  const [minFinalPercentage, setMinFinalPercentage] = useState(90);
  const [inputString, setInputString] = useState("");

  const [covarianceMatrix, setCovarianceMatrix] = useState([]);
  const [inverseCovarianceMatrix, setInverseCovarianceMatrix] = useState([]);
  const [matrixDiagonals, setMatrixDiagonals] = useState({
    covMatDiag: [],
    covInvMatDiag: [],
  });
  const [vif, setVif] = useState([]);
  const [dependentVarIndex, setDependentVarIndex] = useState(0);
  const [regressionIterationData, setRegressionIterationData] = useState({
    regressionData: [],
    regressionMetrics: [],
  });
  const [fittingIterationData, setFittingIterationData] = useState({
    regressionData: [],
    regressionMetrics: [],
    independientVarsLabels: [],
    removed: [],
  });
  const [chartData, setChartData] = useState([]);

  const [toggleContent, setToggleContent] = useState(false);
  const [hasDataInputUpdated, setHasDataInputUpdated] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasDataInputUpdated(false);
    setDependentVarIndex(0);

    const [processedData, formattedData] = parseFlexibleDataSets(
      rawDataSet.length > 0 ? rawDataSet : [[0], [0], [0], [0]]
    );

    if (isArray(processedData) && processedData.length > 0) {
      setRawDataSet(processedData);
      setInputString(formattedData);
      calculateData(processedData);
      setToggleContent(true);
    }
  };

  //Input
  const parseFlexibleDataSets = (input) => {
    let processedData;

    if (Array.isArray(input) && Array.isArray(input[0])) {
      processedData = input;
    } else if (typeof input === "string") {
      const dataGroups = input.match(/[([]([^)()[\]]+)[)\]]/g);

      if (dataGroups) {
        processedData = dataGroups.map((group) =>
          group
            .replace(/[()\[\]]/g, "")
            .split(/[​\s,]+/)
            .map((num) => parseFloat(num.trim()))
            .filter((num) => !isNaN(num))
        );
      } else {
        const rows = input
          .trim()
          .split("\n")
          .map((line) =>
            line
              .trim()
              .split(/[​\s,]+/)
              .map((num) => parseFloat(num))
          );

        const allSameLength = rows.every(
          (row) => row.length === rows[0].length
        );
        if (!allSameLength) {
          console.error("Las filas no tienen la misma longitud.");
          return [[], "Error: Filas desiguales"];
        }

        processedData = rows[0].map((_, colIndex) =>
          rows.map((row) => row[colIndex])
        );
      }
    }

    if (processedData.length === 1) {
      const dataLength = processedData[0].length;
      const extraColumns = Array.from({ length: 1 }, () =>
        Array(dataLength).fill(0)
      );
      processedData = [processedData[0], ...extraColumns];
    }

    const formattedString = processedData
      .map((set) => `[${set.join(",")}]`)
      .join(", ");

    return [processedData, formattedString];
  };

  const calculateData = (datasets, dependentVarIndex = 0) => {
    const [processedData, formattedData] = parseFlexibleDataSets(
      datasets.length > 0 ? datasets : [[0], [0], [0], [0]]
    );
    const covMat = calculateCovarianceMatrix(processedData);
    const invCovMatrix = calculateMatrixInverse(covMat);
    const covMatDiag = calculateDiagonal(covMat);
    const covInvMatDiag = calculateDiagonal(invCovMatrix);
    const diagonals = [];
    diagonals.push(covMatDiag);
    diagonals.push(covInvMatDiag);
    const vif = calculateVIF(covMatDiag, covInvMatDiag);

    let dependentVarAux = datasets[dependentVarIndex];
    let independientVarsAux = [];
    let regressionDataAux = [];
    let regressionMetricsAux = [];
    let regressionIterationAux = [];
    independientVarsAux = datasets.filter((_, i) => i !== dependentVarIndex);
    let independientVarsLabels = datasets
      .map((_, i) => `X${i}`)
      .filter((_, i) => i !== dependentVarIndex);
    let x = [];
    let keepLooping = true;
    let finalIdependentVars = [];
    let fittingLabels = [];
    while (keepLooping) {
      regressionDataAux = calculateLinearRegression(
        independientVarsAux,
        dependentVarAux
      );
      regressionMetricsAux = calculateRegressionMetrics(
        independientVarsAux,
        dependentVarAux,
        regressionDataAux.beta
      );
      regressionIterationAux.push({
        regressionData: regressionDataAux,
        regressionMetrics: regressionMetricsAux,
        independientVarsLabels: [...independientVarsLabels],
      });

      let pValues = regressionDataAux.pValue.filter((_, i) => i !== 0);
      let maxPValueIndex = pValues.indexOf(Math.max(...pValues));

      finalIdependentVars = [...independientVarsAux];
      fittingLabels = [...independientVarsLabels];
      independientVarsLabels = independientVarsLabels.filter(
        (_, i) => i !== maxPValueIndex
      );
      independientVarsAux = independientVarsAux.filter(
        (_, idx) => idx !== maxPValueIndex
      );
      x = regressionDataAux.pValue.filter((p, i) => i !== 0 && p > 0.05);

      if (regressionMetricsAux.p_value > 0.05) {
        keepLooping = false;
        break;
      }

      if (x.length === 0 || maxPValueIndex === -1) {
        keepLooping = false;
        break;
      }
    }

    let fittingDependent = [...dependentVarAux];
    const maxRemovals = Math.floor(fittingDependent.length * 0.1);
    const minPer = minFinalPercentage / 100;
    //const maxRemovals = 1000;
    //const minPer = 0.95;
    let removedFitting = [];
    let rSquared = 0;
    let adjustedRSquared = 0;
    let fittingRegressionAux = [];
    while (
      removedFitting.length < maxRemovals &&
      rSquared <= minPer &&
      adjustedRSquared <= minPer
    ) {
      const regressionDataAux = calculateLinearRegression(
        finalIdependentVars,
        fittingDependent
      );

      const regressionMetricsAux = calculateRegressionMetrics(
        finalIdependentVars,
        fittingDependent,
        regressionDataAux.beta
      );

      fittingRegressionAux.push({
        regressionData: regressionDataAux,
        regressionMetrics: regressionMetricsAux,
        independientVarsLabels: [...fittingLabels],
        removed: [...removedFitting],
      });

      const yhat = calculateYhat(finalIdependentVars, regressionDataAux.beta);
      const error = calculateYError(fittingDependent, yhat);
      const maxErrorIndex = error.indexOf(Math.max(...error));

      if (maxErrorIndex !== -1) {
        finalIdependentVars = finalIdependentVars.map((col) =>
          col.filter((_, idx) => idx !== maxErrorIndex)
        );
        fittingDependent = fittingDependent.filter(
          (_, idx) => idx !== maxErrorIndex
        );
        removedFitting.push(maxErrorIndex);
      }
      rSquared = regressionMetricsAux.R_squared;
      adjustedRSquared = regressionMetricsAux.adjusted_R_squared;
    }

    //setChartData(fittingRegressionAux.regressionMetrics.R_squared);
    const rSquaredValues = fittingRegressionAux.map(
      (iter) => iter.regressionMetrics.R_squared
    );
    setChartData(rSquaredValues);
    setFittingIterationData(fittingRegressionAux);
    setRegressionIterationData(regressionIterationAux);
    setCovarianceMatrix(covMat);
    setInverseCovarianceMatrix(invCovMatrix);
    setMatrixDiagonals({ covMatDiag, covInvMatDiag });
    setVif(vif);
  };

  const calculateCovarianceMatrix = (datasets) => {
    const n = datasets[0].length;
    const means = datasets.map(calculateMean);

    const covarianceMatrix = datasets.map((_, i) =>
      datasets.map((_, j) => {
        let sum = 0;
        for (let k = 0; k < n; k++) {
          sum += (datasets[i][k] - means[i]) * (datasets[j][k] - means[j]);
        }
        return parseFloat((sum / (n - 1)).toFixed(4));
      })
    );

    return covarianceMatrix;
  };

  const calculateMatrixInverse = (matrix) => {
    const size = matrix.length;
    let identity = matrix.map((row, i) => row.map((_, j) => (i === j ? 1 : 0)));
    let copy = matrix.map((row) => [...row]);

    for (let i = 0; i < size; i++) {
      let diagValue = copy[i][i];
      if (diagValue === 0)
        throw new Error("Matrix is singular and cannot be inverted.");
      for (let j = 0; j < size; j++) {
        copy[i][j] /= diagValue;
        identity[i][j] /= diagValue;
      }
      for (let k = 0; k < size; k++) {
        if (k !== i) {
          let factor = copy[k][i];
          for (let j = 0; j < size; j++) {
            copy[k][j] -= factor * copy[i][j];
            identity[k][j] -= factor * identity[i][j];
          }
        }
      }
    }

    return identity;
  };

  const calculateDiagonal = (matrix) =>
    matrix.map((row, i) => parseFloat(row[i].toFixed(4)));

  const calculateVIF = (d1, d2) =>
    d1.map((val, i) => parseFloat(1 - 1 / (val * d2[i])));

  const calculateMean = (data) => {
    const sum = data.reduce((total, num) => total + num, 0);
    return parseFloat((sum / data.length).toFixed(4));
  };

  const calculateLinearRegression = (X, y) => {
    const transpose = (matrix) =>
      matrix[0].map((_, i) => matrix.map((row) => row[i]));
    const multiply = (A, B) =>
      A.map((row) =>
        B[0].map((_, j) => row.reduce((sum, el, k) => sum + el * B[k][j], 0))
      );
    const inverse = (matrix) => {
      const size = matrix.length;
      const identity = matrix.map((row, i) =>
        row.map((_, j) => (i === j ? 1 : 0))
      );
      const copy = matrix.map((row) => [...row]);

      for (let i = 0; i < size; i++) {
        let diagValue = copy[i][i];
        if (diagValue === 0)
          throw new Error("Matrix is singular and cannot be inverted.");
        for (let j = 0; j < size; j++) {
          copy[i][j] /= diagValue;
          identity[i][j] /= diagValue;
        }
        for (let k = 0; k < size; k++) {
          if (k !== i) {
            let factor = copy[k][i];
            for (let j = 0; j < size; j++) {
              copy[k][j] -= factor * copy[i][j];
              identity[k][j] -= factor * identity[i][j];
            }
          }
        }
      }
      return identity;
    };

    const n = y.length;
    const X_withIntercept = X[0].map((_, i) => [1, ...X.map((row) => row[i])]);
    const Xt = transpose(X_withIntercept);
    const XtX = multiply(Xt, X_withIntercept);
    const XtY = multiply(
      Xt,
      y.map((val) => [val])
    );
    const beta = multiply(inverse(XtX), XtY).map((b) => b[0]);

    const y_pred = X_withIntercept.map((row) =>
      row.reduce((sum, val, i) => sum + val * beta[i], 0)
    );
    const residuals = y.map((val, i) => val - y_pred[i]);
    const SSE = residuals.reduce((sum, e) => sum + e ** 2, 0);
    const MSE = SSE / (n - X_withIntercept[0].length);

    const XtX_inv = inverse(XtX);
    const SE = beta.map((_, i) => Math.sqrt(MSE * XtX_inv[i][i]));
    const tStat = beta.map((b, i) => b / SE[i]);

    // Usamos jStat para calcular los p-values directamente
    const pValue = tStat.map(
      (t) =>
        2 * (1 - jStat.studentt.cdf(Math.abs(t), n - X_withIntercept[0].length))
    );

    return { beta, SE, tStat, pValue };
  };

  const calculateRegressionMetrics = (X, y, beta) => {
    const n = y.length;
    const p = beta.length - 1; // Restamos el intercepto

    // Añadir el intercepto a X
    const X_withIntercept = X[0].map((_, i) => [1, ...X.map((row) => row[i])]);

    // Calcular predicciones
    const y_pred = X_withIntercept.map((row) =>
      row.reduce((sum, val, i) => sum + val * beta[i], 0)
    );

    // Calcular errores
    const residuals = y.map((val, i) => val - y_pred[i]);
    const SSE = residuals.reduce((sum, e) => sum + e ** 2, 0);
    const y_mean = y.reduce((a, b) => a + b, 0) / n;
    const SST = y.reduce((sum, val) => sum + (val - y_mean) ** 2, 0);

    // Calcular métricas
    const errorDegreesOfFreedom = n - (p + 1); // Ajustamos grados de libertad
    const RMSE = Math.sqrt(SSE / errorDegreesOfFreedom);
    const R_squared = 1 - SSE / SST;
    const adjusted_R_squared =
      1 - (1 - R_squared) * ((n - 1) / errorDegreesOfFreedom);

    const SSR = SST - SSE;
    const MSR = SSR / p;
    const MSE = SSE / errorDegreesOfFreedom;
    const F_statistic = MSR / MSE;

    const p_value =
      1 - jStat.centralF.cdf(F_statistic, p, errorDegreesOfFreedom);

    return {
      numberOfObservations: n,
      errorDegreesOfFreedom,
      RMSE,
      R_squared,
      adjusted_R_squared,
      F_statistic,
      p_value,
    };
  };

  const calculateYhat = (independentVars, beta) => {
    const n = independentVars[0].length;

    let X = Array.from({ length: n }, (_, i) => [
      1,
      ...independentVars.map((col) => col[i]),
    ]);

    const yhat = X.map((row) =>
      row.reduce((sum, value, index) => sum + value * beta[index], 0)
    );

    return yhat;
  };

  const calculateYError = (y, yhat) => {
    if (y.length !== yhat.length) {
      throw new Error("Las longitudes de 'y' y 'yhat' deben ser iguales.");
    }

    return y.map((val, i) => Math.abs(val - yhat[i]));
  };

  return (
    <div className={`${styles.content}`}>
      <h2 className={`${styles.h2}`}>What is it about?</h2>
      <p>
        <strong>Expected Input:</strong> <br />
        Multiple numerical datasets in the form of arrays (e.g., [x1, x2, x3,
        ..., xn], [y1, y2, y3, ..., yn], [z1, z2, z3, ..., zn], ...) or multiple
        data columns, similar to MATLAB or Excel formatting.
        <br />
        <br />
        <strong>Process: </strong> <br />
        Using the provided datasets, the tool calculates the covariance matrix
        between variables, followed by the inverse of the covariance matrix and
        the Variance Inflation Factor (VIF) for each variable to detect
        multicollinearity. A linear regression model is built for a selected
        target variable. The model iteratively computes key regression
        statistics — Estimate Coefficients, Standard Error, t-Statistic, and
        p-Value — for the intercept and each variable. Additionally, it
        generates a performance metrics table including Number of Observations,
        Error Degrees of Freedom, Root Mean Squared Error, R-squared, Adjusted
        R-squared, F-statistic vs. Constant Model, and p-value. In each
        iteration, the variable with the highest p-value that exceeds 0.05 is
        removed from the regression model. This process repeats until no
        remaining variables have a p-value greater than 0.05. <br /> <br />
        <strong>Expected Output:</strong>
      </p>
      <ul className={`${styles.ul}`}>
        <li>Covariance Matrix</li>
        <li>Inverse Covariance Matrix</li>
        <li>Matrices Diagonals</li>
        <li>Variance Inflation Factor for each variable</li>
        <li>Linear Regression Model</li>
        <li>Fitted Linear Regression Model</li>
      </ul>
      <hr />
      <form onSubmit={handleSubmit} className={`${formStyles.form}`}>
        <label htmlFor="rawdatasetInput" className={`${formStyles.label}`}>
          {"Multi-Dimensional Dataset"}
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
        <label htmlFor="minFinalPercentage" className={`${formStyles.label}`}>
          {
            "minimum acceptable percentage for the reconstruction of the dependent variable "
          }
          <input
            className={`${formStyles.input}`}
            type="number"
            name="minFinalPercentage"
            id="minFinalPercentage"
            placeholder="..."
            defaultValue={90}
            max={100}
            onChange={(e) => {
              setHasDataInputUpdated(true);
              setMinFinalPercentage(parseInt(e.target.value));
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
          <CollapsibleSection
            HiddenMessage="Show Covariance Matrices"
            ShownMessage="Hide Covariance Matrices"
          >
            <h2>Covariance Matrix</h2>
            <div className={`${tableStyles.table_container}`}>
              <table className={`${tableStyles.table}`}>
                <thead>
                  <tr>
                    <th></th>
                    {covarianceMatrix.map((_, index) => (
                      <th key={index}>{`X${index}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {covarianceMatrix.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td
                        className={`${tableStyles.highlighted_row}`}
                      >{`X${rowIndex}`}</td>
                      {row.map((value, colIndex) => (
                        <td key={colIndex}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2>Inverse Covariance Matrix</h2>
            <div className={`${tableStyles.table_container}`}>
              <table className={`${tableStyles.table}`}>
                <thead>
                  <tr>
                    <th></th>
                    {inverseCovarianceMatrix.map((_, index) => (
                      <th key={index}>{`X${index}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inverseCovarianceMatrix.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td
                        className={`${tableStyles.highlighted_row}`}
                      >{`X${rowIndex}`}</td>
                      {row.map((value, colIndex) => (
                        <td key={colIndex}>{value.toFixed(4)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h2>Matrices Diagonals</h2>
            <div className={`${tableStyles.table_container}`}>
              <table className={`${tableStyles.table}`}>
                <thead>
                  <tr>
                    <th>Matrix</th>
                    <th>Diagonal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>Covariance</strong>
                    </td>
                    <td>{`[${matrixDiagonals.covMatDiag}]`}</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>Inverse Covariance</strong>
                    </td>
                    <td>{`[${matrixDiagonals.covInvMatDiag}]`}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
          <hr />
          <h2>Variance Inflation Factor</h2>
          <div className={`${tableStyles.table_container}`}>
            <table className={`${tableStyles.table}`}>
              <thead>
                <tr>
                  <th>VIF</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {vif.map((v, index) => (
                  <tr key={index}>
                    <td>
                      <strong>{`R(X${index})`}</strong>
                    </td>
                    <td>{`${v.toFixed(4)}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <hr />
          <h2>Linear Regresion Model</h2>
          <label
            htmlFor="dependentVariableInput"
            className={`${formStyles.label}`}
          >
            {"Select a Dependent Variable"}
            <select
              name="dependentVariableInput"
              id="dependentVariableInput"
              className={`${formStyles.option}`}
              value={dependentVarIndex}
              onChange={(e) => {
                setDependentVarIndex(parseInt(e.target.value));
                calculateData(rawDataSet, parseInt(e.target.value));
              }}
            >
              {vif.map((_, index) => (
                <option key={index} value={index}>{`X${index}`}</option>
              ))}
            </select>
          </label>
          {regressionIterationData.length > 0 && (
            <div key={regressionIterationData.length - 1}>
              <h2>Iteration {regressionIterationData.length}</h2>
              {(() => {
                const lastIteration =
                  regressionIterationData[regressionIterationData.length - 1];
                return (
                  <>
                    <div className={`${tableStyles.table_container}`}>
                      <table className={`${tableStyles.table}`}>
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Estimate Coefficients</th>
                            <th>Standard Error</th>
                            <th>Statistic-T</th>
                            <th>P-Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            "Intercept",
                            ...lastIteration.independientVarsLabels,
                          ].map((name, idx) => (
                            <tr key={idx}>
                              <td className={`${tableStyles.highlighted_row}`}>
                                {name}
                              </td>
                              <td>
                                {lastIteration.regressionData.beta[idx].toFixed(
                                  6
                                )}
                              </td>
                              <td>
                                {lastIteration.regressionData.SE[idx].toFixed(
                                  6
                                )}
                              </td>
                              <td>
                                {lastIteration.regressionData.tStat[
                                  idx
                                ].toFixed(6)}
                              </td>
                              <td>
                                {lastIteration.regressionData.pValue[idx]
                                  .toString()
                                  .includes("e")
                                  ? lastIteration.regressionData.pValue[
                                      idx
                                    ].toExponential(2)
                                  : lastIteration.regressionData.pValue[
                                      idx
                                    ].toFixed(10)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className={`${tableStyles.table_container}`}>
                      <table className={`${tableStyles.table}`}>
                        <thead>
                          <tr>
                            <th>Number of observations</th>
                            <th>Error degrees of freedom</th>
                            <th>Root Mean Squared Error</th>
                            <th>R-squared</th>
                            <th>Adjusted R-Squared</th>
                            <th>F-statistic vs. constant model</th>
                            <th>p-value</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              {
                                lastIteration.regressionMetrics
                                  .numberOfObservations
                              }
                            </td>
                            <td>
                              {
                                lastIteration.regressionMetrics
                                  .errorDegreesOfFreedom
                              }
                            </td>
                            <td>
                              {lastIteration.regressionMetrics.RMSE.toFixed(3)}
                            </td>
                            <td>
                              {lastIteration.regressionMetrics.R_squared.toFixed(
                                3
                              )}
                            </td>
                            <td>
                              {lastIteration.regressionMetrics.adjusted_R_squared.toFixed(
                                3
                              )}
                            </td>
                            <td>
                              {lastIteration.regressionMetrics.F_statistic.toFixed(
                                2
                              )}
                            </td>
                            <td>
                              {lastIteration.regressionMetrics.p_value
                                .toString()
                                .includes("e")
                                ? lastIteration.regressionMetrics.p_value.toExponential(
                                    2
                                  )
                                : lastIteration.regressionMetrics.p_value.toFixed(
                                    10
                                  )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
          <hr />
          <CollapsibleSection
            ShownMessage="Hide Linear Regresion Steps"
            HiddenMessage="Show Linear Regresion Steps"
          >
            {regressionIterationData.map((iteration, index) => (
              <div key={index}>
                <h2>Iteration {index + 1}</h2>
                <div className={`${tableStyles.table_container}`}>
                  <table className={`${tableStyles.table}`}>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Estimate Coefficients</th>
                        <th>Standard Error</th>
                        <th>Statistic-T</th>
                        <th>P-Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {["Intercept", ...iteration.independientVarsLabels].map(
                        (name, idx) => (
                          <tr key={idx}>
                            <td className={`${tableStyles.highlighted_row}`}>
                              {name}
                            </td>
                            <td>
                              {iteration.regressionData.beta[idx].toFixed(6)}
                            </td>
                            <td>
                              {iteration.regressionData.SE[idx].toFixed(6)}
                            </td>
                            <td>
                              {iteration.regressionData.tStat[idx].toFixed(6)}
                            </td>
                            <td>
                              {iteration.regressionData.pValue[idx]
                                .toString()
                                .includes("e")
                                ? iteration.regressionData.pValue[
                                    idx
                                  ].toExponential(2)
                                : iteration.regressionData.pValue[idx].toFixed(
                                    10
                                  )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <div className={`${tableStyles.table_container}`}>
                  <table className={`${tableStyles.table}`}>
                    <thead>
                      <tr>
                        <th>Number of observations</th>
                        <th>Error degrees of freedom</th>
                        <th>Root Mean Squared Error</th>
                        <th>R-squared</th>
                        <th>Adjusted R-Squared</th>
                        <th>F-statistic vs. constant model</th>
                        <th>p-value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          {iteration.regressionMetrics.numberOfObservations}
                        </td>
                        <td>
                          {iteration.regressionMetrics.errorDegreesOfFreedom}
                        </td>
                        <td>{iteration.regressionMetrics.RMSE.toFixed(3)}</td>
                        <td>
                          {iteration.regressionMetrics.R_squared.toFixed(3)}
                        </td>
                        <td>
                          {iteration.regressionMetrics.adjusted_R_squared.toFixed(
                            3
                          )}
                        </td>
                        <td>
                          {iteration.regressionMetrics.F_statistic.toFixed(2)}
                        </td>
                        <td>
                          {iteration.regressionMetrics.p_value
                            .toString()
                            .includes("e")
                            ? iteration.regressionMetrics.p_value.toExponential(
                                2
                              )
                            : iteration.regressionMetrics.p_value.toFixed(10)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </CollapsibleSection>
          <hr />
          <h2>Fitting Linear Regression Model</h2>
          {fittingIterationData.length > 0 && (
            <div>
              {(() => {
                const lastIteration =
                  fittingIterationData[fittingIterationData.length - 1];
                return (
                  <>
                    <div className={`${tableStyles.table_container}`}>
                      <table className={`${tableStyles.table}`}>
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>Estimate Coefficients</th>
                            <th>Standard Error</th>
                            <th>Statistic-T</th>
                            <th>P-Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            "Intercept",
                            ...lastIteration.independientVarsLabels,
                          ].map((name, idx) => (
                            <tr key={idx}>
                              <td className={`${tableStyles.highlighted_row}`}>
                                {name}
                              </td>
                              <td>
                                {lastIteration.regressionData.beta[idx].toFixed(
                                  6
                                )}
                              </td>
                              <td>
                                {lastIteration.regressionData.SE[idx].toFixed(
                                  6
                                )}
                              </td>
                              <td>
                                {lastIteration.regressionData.tStat[
                                  idx
                                ].toFixed(6)}
                              </td>
                              <td>
                                {lastIteration.regressionData.pValue[idx]
                                  .toString()
                                  .includes("e")
                                  ? lastIteration.regressionData.pValue[
                                      idx
                                    ].toExponential(2)
                                  : lastIteration.regressionData.pValue[
                                      idx
                                    ].toFixed(10)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className={`${tableStyles.table_container}`}>
                      <table className={`${tableStyles.table}`}>
                        <thead>
                          <tr>
                            <th>Number of observations</th>
                            <th>Error degrees of freedom</th>
                            <th>Root Mean Squared Error</th>
                            <th>R-squared</th>
                            <th>Adjusted R-Squared</th>
                            <th>F-statistic vs. constant model</th>
                            <th>p-value</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              {
                                lastIteration.regressionMetrics
                                  .numberOfObservations
                              }
                            </td>
                            <td>
                              {
                                lastIteration.regressionMetrics
                                  .errorDegreesOfFreedom
                              }
                            </td>
                            <td>
                              {lastIteration.regressionMetrics.RMSE.toFixed(3)}
                            </td>
                            <td>
                              {lastIteration.regressionMetrics.R_squared.toFixed(
                                3
                              )}
                            </td>
                            <td>
                              {lastIteration.regressionMetrics.adjusted_R_squared.toFixed(
                                3
                              )}
                            </td>
                            <td>
                              {lastIteration.regressionMetrics.F_statistic.toFixed(
                                2
                              )}
                            </td>
                            <td>
                              {lastIteration.regressionMetrics.p_value
                                .toString()
                                .includes("e")
                                ? lastIteration.regressionMetrics.p_value.toExponential(
                                    2
                                  )
                                : lastIteration.regressionMetrics.p_value.toFixed(
                                    10
                                  )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <textarea
                      readOnly
                      className={`${formStyles.textArea}`}
                      value={`Removed Items Amount: ${lastIteration.removed.length} \n\n[${lastIteration.removed}]`}
                    ></textarea>
                  </>
                );
              })()}
            </div>
          )}
          <Chart iterations={chartData}></Chart>
          <hr />
          <CollapsibleSection
            ShownMessage="Hide Fitting Linear Regresion Steps"
            HiddenMessage="Show Fitting Linear Regresion Steps"
          >
            {fittingIterationData.map((iteration, index) => (
              <div key={index}>
                <h2>Iteration {index + 1}</h2>
                <div className={`${tableStyles.table_container}`}>
                  <table className={`${tableStyles.table}`}>
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Estimate Coefficients</th>
                        <th>Standard Error</th>
                        <th>Statistic-T</th>
                        <th>P-Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {["Intercept", ...iteration.independientVarsLabels].map(
                        (name, idx) => (
                          <tr key={idx}>
                            <td className={`${tableStyles.highlighted_row}`}>
                              {name}
                            </td>
                            <td>
                              {iteration.regressionData.beta[idx].toFixed(6)}
                            </td>
                            <td>
                              {iteration.regressionData.SE[idx].toFixed(6)}
                            </td>
                            <td>
                              {iteration.regressionData.tStat[idx].toFixed(6)}
                            </td>
                            <td>
                              {iteration.regressionData.pValue[idx]
                                .toString()
                                .includes("e")
                                ? iteration.regressionData.pValue[
                                    idx
                                  ].toExponential(2)
                                : iteration.regressionData.pValue[idx].toFixed(
                                    10
                                  )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
                <div className={`${tableStyles.table_container}`}>
                  <table className={`${tableStyles.table}`}>
                    <thead>
                      <tr>
                        <th>Number of observations</th>
                        <th>Error degrees of freedom</th>
                        <th>Root Mean Squared Error</th>
                        <th>R-squared</th>
                        <th>Adjusted R-Squared</th>
                        <th>F-statistic vs. constant model</th>
                        <th>p-value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          {iteration.regressionMetrics.numberOfObservations}
                        </td>
                        <td>
                          {iteration.regressionMetrics.errorDegreesOfFreedom}
                        </td>
                        <td>{iteration.regressionMetrics.RMSE.toFixed(3)}</td>
                        <td>
                          {iteration.regressionMetrics.R_squared.toFixed(3)}
                        </td>
                        <td>
                          {iteration.regressionMetrics.adjusted_R_squared.toFixed(
                            3
                          )}
                        </td>
                        <td>
                          {iteration.regressionMetrics.F_statistic.toFixed(2)}
                        </td>
                        <td>
                          {iteration.regressionMetrics.p_value
                            .toString()
                            .includes("e")
                            ? iteration.regressionMetrics.p_value.toExponential(
                                2
                              )
                            : iteration.regressionMetrics.p_value.toFixed(10)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <textarea
                  readOnly
                  className={`${formStyles.textArea}`}
                  value={`Removed Items Amount: ${iteration.removed.length} \n\n[${iteration.removed}]`}
                ></textarea>
              </div>
            ))}
          </CollapsibleSection>
          <hr />
        </>
      )}
    </div>
  );
};

export default Page;
