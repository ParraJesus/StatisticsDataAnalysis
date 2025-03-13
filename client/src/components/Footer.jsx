import React from "react";
import styles from "../stylesheets/Footer.module.css";

const Footer = () => {
  return (
    <footer className={`${styles.shadow} ${styles.footer_container}`}>
      <p className={styles.footer_p}>
        Project by Jesús Gabriel Parra Dugarte
        <br />
        GitHub: ParraJesus <br />
        Probability and Statistics Course <br />
        Faculty of Electronic Engineering and Telecommunications
        <br />
        University of Cauca 2025
      </p>
    </footer>
  );
};

export default Footer;
