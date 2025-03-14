import React, { useState } from "react";
import styles from "../../stylesheets/Layout.module.css";
import formStyles from "../../stylesheets/Form.module.css";
import tableStyles from "../../stylesheets/Table.module.css";

const Page = () => {
  const [toggleContent, setToggleContent] = useState(false);
  const [rawDataSet, setRawDataSet] = useState("");
  const [hasDataUpdated, setHasDataUpdated] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setHasDataUpdated(false);

    const dataToProcess = Array.isArray(rawDataSet)
      ? rawDataSet.join(", ")
      : rawDataSet;

    const filteredData =
      dataToProcess.match(/-?\d+(\.\d+)?/g)?.map(Number) || [];

    setRawDataSet(filteredData);
    setToggleContent(true);
  };

  return (
    <div className={`${styles.content}`}>
      <h2 className={`${styles.h2}`}>What is it about?</h2>
      <p>
        When a dataset is entered as input, the standard deviation will be
        iteratively calculated, the data will be zeta-scaled, and all unusual
        data will be cut off —those whose number of standard deviations is equal
        to or greater than three- The result will be the following information
        for each iteration:
      </p>
      <ul className={`${styles.ul}`}>
        <li>Mean</li>
        <li>Median</li>
        <li>Standar Deviation</li>
        <li>Removed Items List</li>
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
              setHasDataUpdated(true);
              setRawDataSet(e.target.value);
            }}
          ></textarea>
        </label>
        <button
          type="submit"
          className={`${formStyles.button_first} ${formStyles.button_general} ${
            hasDataUpdated ? formStyles.highlighted_Button : ""
          }`.trimEnd()}
        >
          Confirm
        </button>
      </form>
      {toggleContent && (
        <>
          <hr />
          <h2>Iterated Calculations</h2>
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
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <hr />
          <h2>Evolution Of Data Through Iterations</h2>
          <hr />
          <h2>Data After Filter</h2>
          <textarea
            name="resultingDataTextArea"
            id="resultingDataTextArea"
            readOnly
            className={`${formStyles.textArea}`}
          ></textarea>
        </>
      )}
    </div>
  );
};

export default Page;
