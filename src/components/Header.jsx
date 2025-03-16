import React from "react";
import styles from "../stylesheets/Header.module.css";

const Header = ({ title }) => {
  return (
    <header className={`${styles.shadow} ${styles.header_container}`}>
      <h1 className={styles.h1}>{title}</h1>
    </header>
  );
};

export default Header;
