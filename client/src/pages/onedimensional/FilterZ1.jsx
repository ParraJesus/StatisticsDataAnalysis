import React from "react";
import styles from "../../stylesheets/Layout.module.css";

const Page = () => {
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
    </div>
  );
};

export default Page;
