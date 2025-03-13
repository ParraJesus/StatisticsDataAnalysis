import React from "react";
import styles from "../stylesheets/SideMenu.module.css";
import SideMenuSubItem from "./SideMenuSubItem.jsx";

import { ReactComponent as Chevron } from "../assets/icons/chevron_icon.svg";

const SideMenuItem = ({
  text,
  Icon,
  subitems,
  isExpanded,
  onClick,
  displayItems,
}) => {
  return (
    <div
      className={`${styles.sideMenu_item_container}${
        isExpanded ? `${styles.expanded}` : ""
      }`.trimEnd()}
      onClick={onClick}
    >
      {!isExpanded && (
        <>
          <div className={`${styles.sideMenu_item}`}>
            <Icon className={`${styles.list_icon}`} />
          </div>
        </>
      )}
      {isExpanded && (
        <>
          <div className={`${styles.sideMenu_item}`}>
            <Icon className={`${styles.list_icon}`} />
            <p>{text}</p>
            <Chevron
              className={`${styles.list_icon} ${
                displayItems ? styles.lookingUp : styles.lookingDown
              }`.trimEnd()}
            />
          </div>
          {displayItems && (
            <div className={`${styles.sideMenu_item_subitems}`}>
              <ul className={`${styles.ul}`}>
                {subitems.map((subitem, index) => (
                  <SideMenuSubItem
                    key={index}
                    text={subitem.text}
                    link={subitem.link}
                  />
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SideMenuItem;
