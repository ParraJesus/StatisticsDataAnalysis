import React from "react";
import { Link } from "react-router-dom";
import styles from "../stylesheets/SideMenu.module.css";

const SideMenuSubItem = ({ text, link }) => {
  return (
    <li className={`${styles.li}`}>
      <Link className={`${styles.subitem_link}`} to={link}>
        {text}
      </Link>
    </li>
  );
};

export default SideMenuSubItem;
