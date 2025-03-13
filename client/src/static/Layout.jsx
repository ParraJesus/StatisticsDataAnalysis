import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import styles from "../stylesheets/Layout.module.css";

import Header from "../components/Header";
import Footer from "../components/Footer";
import SideMenu from "../components/SideMenu";

const routeTitles = {
  "/onedimensional/filters/zscore1": "First Z Score Filter",
  "/onedimensional/filters/zscore2": "Second Z Score Filter",
  "/onedimensional/filters/boxplot1": "First Boxplot Filter",
  "/onedimensional/filters/boxplot2": "Second Boxplot Filter",
};

const Layout = () => {
  const location = useLocation();

  const headerTitle =
    routeTitles[location.pathname] || "Statistics Data Analysis";

  return (
    <div className={styles.page_container}>
      <SideMenu />
      <div className={styles.main_container}>
        <Header title={headerTitle}></Header>
        <main className={`${styles.content_container}`}>
          <Outlet />
        </main>
        <Footer></Footer>
      </div>
    </div>
  );
};

export default Layout;
