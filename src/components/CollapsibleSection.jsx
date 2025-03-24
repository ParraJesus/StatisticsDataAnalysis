import { useState } from "react";
import styles from "../stylesheets/CollapsibleSection.module.css";
import formStyles from "../stylesheets/Form.module.css";

const CollapsibleSection = ({
  HiddenMessage = "Show",
  ShownMessage = "Hide",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <div className={`${styles.section_container}`}>
      <div className={`${styles.control_section}`}>
        <button
          className={`${formStyles.button_second} ${formStyles.button_general}`}
          onClick={toggleOpen}
        >
          {`${isOpen ? ShownMessage : HiddenMessage}`}
        </button>
      </div>
      <div
        className={`${styles.content_section} ${
          isOpen ? styles.open : ""
        }`.trimEnd()}
      >
        {isOpen && <>{children}</>}
      </div>
    </div>
  );
};

export default CollapsibleSection;
