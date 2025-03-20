import React, { useState } from "react";
import styles from "../stylesheets/SideMenu.module.css";

//Icons
import { ReactComponent as OneDimensionalIcon } from "../assets/icons/one_dimensional_icon.svg";
import { ReactComponent as TwoDimensionalIcon } from "../assets/icons/two_dimensional_icon.svg";
import { ReactComponent as MultiDimensionalIcon } from "../assets/icons/multi_dimensional_icon.svg";

//Components
import SideMenuItem from "./SideMenuItem";

const SideMenu = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeMenuIndex, setActiveMenuIndex] = useState(-1);

  const sideMenuData = [
    {
      text: "One Dimensional Data",
      icon: OneDimensionalIcon,
      subItems: [
        {
          text: "First Z-score filter",
          link: "/onedimensional/filters/zscore1",
        },
        {
          text: "Second Z-score filter",
          link: "/onedimensional/filters/zscore2",
        },
        {
          text: "First boxplot filter",
          link: "/onedimensional/filters/boxplot1",
        },
        {
          text: "Second boxplot filter",
          link: "/onedimensional/filters/boxplot2",
        },
        {
          text: "Data Tabulation",
          link: "/onedimensional/tabulation",
        },
        {
          text: "Synthetic Data",
          link: "/onedimensional/synthetic",
        },
      ],
    },
    {
      text: "Two Dimensional Data",
      icon: TwoDimensionalIcon,
      subItems: [
        {
          text: "Two-Ways Data Tabulation",
          link: "/twodimensional/tabulation",
        },
      ],
    },
    {
      text: "Multi Dimensional Data",
      icon: MultiDimensionalIcon,
      subItems: [
        {
          text: "Linear Correlation",
          link: "/multidimensional/correlation",
        },
      ],
    },
  ];

  const handleMenuItemClick = (index) => {
    setActiveMenuIndex(index === activeMenuIndex ? -1 : index);
  };

  return (
    <div
      className={`${styles.sideMenu} ${
        isExpanded ? `${styles.expanded}` : ""
      }`.trimEnd()}
      onMouseEnter={() => {
        setIsExpanded(true);
      }}
      onMouseLeave={() => {
        setIsExpanded(false);
      }}
    >
      {!isExpanded && (
        <>
          <div className={`${styles.sideMenu_logo_container}`}>
            <div
              title="Gabriel Parra"
              className={`${styles.img_container}`}
            ></div>
          </div>
          {sideMenuData.map((menuItem, index) => (
            <SideMenuItem
              key={index}
              text={menuItem.text}
              Icon={menuItem.icon}
              subitems={menuItem.subItems}
              isExpanded={false}
            />
          ))}
        </>
      )}
      {isExpanded && (
        <>
          <div className={`${styles.sideMenu_logo_container}`}>
            <div
              className={`${styles.img_container}`}
              title="Gabriel Parra"
            ></div>
            <p>
              <strong>Statistic Data Analysis</strong>
            </p>
          </div>
          {sideMenuData.map((menuItem, index) => (
            <SideMenuItem
              key={index}
              text={menuItem.text}
              Icon={menuItem.icon}
              subitems={menuItem.subItems}
              isExpanded={true}
              onClick={() => {
                handleMenuItemClick(index);
              }}
              displayItems={activeMenuIndex === index ? true : false}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default SideMenu;
