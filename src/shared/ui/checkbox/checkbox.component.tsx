import { FC } from "react";
import "./checkbox.component.scss";

type Props = {
  checked: boolean;
  onClickHandler: () => void;
};

const Checkbox: FC<Props> = ({ checked, onClickHandler }) => {
  return (
    <div
      className={`checkbox ${checked ? "checkbox--checked" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onClickHandler();
      }}
      role="checkbox"
      aria-checked={checked}
    >
      {checked && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M1.5 5.2 L3.8 7.5 L8.5 2.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
};

export default Checkbox;
