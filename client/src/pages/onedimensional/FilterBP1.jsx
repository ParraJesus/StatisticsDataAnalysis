import React from "react";
import styles from "../../stylesheets/Layout.module.css";

const Page = () => {
  return (
    <div className={`${styles.content}`}>
      <h2 className={`${styles.h2}`}>What is it about?</h2>
      <p>
        When a dataset is entered as input, this filter will calculate
        iteratively percentiles 25, 50, 75, IQR, whiskers and outliers of a
        boxplot chart. On every iteration the outliers will be cut off. The
        result will be the following information for each iteration:
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
    </div>
  );
};

export default Page;
